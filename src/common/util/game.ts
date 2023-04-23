import {
  compact, filter, findKey, flatMap,
  intersection, isArray, isEqual, isString, isUndefined, mapValues, noop, remove, some, times, uniqBy
} from 'lodash';

import GridGenerator from '../components/hexgrid/GridGenerator';
import Hex from '../components/hexgrid/Hex';
import HexUtils from '../components/hexgrid/HexUtils';
import {
  BLUE_PLACEMENT_HEXES, DEFAULT_GAME_FORMAT, ENABLE_ULTRA_VERBOSE_DEBUG_GAME_LOG, MAX_EXECUTION_STACK_SIZE, MAX_HAND_SIZE, ORANGE_PLACEMENT_HEXES,
  stringToType, TYPE_CORE, TYPE_ROBOT, TYPE_STRUCTURE
} from '../constants';
import * as g from '../guards';
import { defaultTarget } from '../store/defaultGameState';
import * as w from '../types';
import buildVocabulary from '../vocabulary/vocabulary';

import { assertCardVisible } from './cards';
import { clamp, id as generateId, isErrorWithMessage } from './common';
import { markAchievement } from './firebase';
import { GameFormat, SharedDeckGameFormat } from './formats';

//
// I. Queries for game state.
//

/** Given a player color, return the color of the opposing player. */
export function opponent(playerName: w.PlayerColor): w.PlayerColor {
  return (playerName === 'blue') ? 'orange' : 'blue';
}

/** Return the color of the opponent to the current player. */
function opponentName(state: w.GameState): w.PlayerColor {
  return opponent(state.currentTurn);
}

/** Return the current player's `PlayerInGameState`. */
export function currentPlayer(state: w.GameState): w.PlayerInGameState {
  return state.players[state.currentTurn];
}

/** Return the `PlayerInGameState` of the current player's opponent. */
export function opponentPlayer(state: w.GameState): w.PlayerInGameState {
  return state.players[opponentName(state)];
}

/** Return whether it's the active player's turn (i.e. whether the active player === the current player). */
export function isMyTurn(state: w.GameState): boolean {
  return state.currentTurn === state.player;
}

/** If in a tutorial, return the current `TutorialStep`. */
export function currentTutorialStep(state: w.GameState): w.TutorialStep | undefined {
  if ((state.tutorial || state.sandbox) && state.tutorialSteps) {
    const idx = state.tutorialCurrentStepIdx || 0;
    const step = state.tutorialSteps[idx];
    return {
      ...step,
      idx,
      numSteps: state.tutorialSteps.length
    };
  }
}

/** Return a (hexId -> Object) record of all objects on the board. */
export function allObjectsOnBoard(state: w.GameState): { [hexId: string]: w.Object } {
  return { ...state.players.blue.objectsOnBoard, ...state.players.orange.objectsOnBoard };
}

/** Return the `PlayerInGameState` of the owner of the given object. */
export function ownerOf(state: w.GameState, object: w.Object): w.PlayerInGameState | undefined {
  if (some(state.players.blue.objectsOnBoard, ['id', object.id])) {
    return state.players.blue;
  } else if (some(state.players.orange.objectsOnBoard, ['id', object.id])) {
    return state.players.orange;
  } else if (state.objectsDestroyedThisTurn[object.id]) {
    const [, ownerColor] = state.objectsDestroyedThisTurn[object.id];
    return state.players[ownerColor];
  }
}

/** Return the `PlayerInGameState` of the owner of the given card. */
export function ownerOfCard(state: w.GameState, card: w.CardInGame): w.PlayerInGameState | undefined {
  if (some(state.players.blue.hand, ['id', card.id])) {
    return state.players.blue;
  } else if (some(state.players.orange.hand, ['id', card.id])) {
    return state.players.orange;
  }
}

/** Return the Object on the board with the given id, or undefined if said object isn't on the board. */
function getObjectById(state: w.GameState, objectId: w.ObjectId): w.Object | undefined {
  return Object.values(allObjectsOnBoard(state)).find((o) => o.id === objectId);
}

/** Return the card in any player's hand with the given id, or undefined if said card isn't present. */
function getCardInHandById(state: w.GameState, cardId: w.CardId): w.CardInGame | undefined {
  return [...state.players.blue.hand, ...state.players.orange.hand,].map(assertCardVisible).find(c => c.id === cardId);
}

/** Return the card in any player's discard pile with the given id, or undefined if said card isn't present. */
function getCardInDiscardPileById(state: w.GameState, cardId: w.CardId): w.CardInGame | undefined {
  return [...state.players.blue.discardPile, ...state.players.orange.discardPile].map(assertCardVisible).find(c => c.id === cardId);
}

/** Given an object or card and attribute name, return the value of that attribute for that object/card. */
export function getAttribute(objectOrCard: w.Object | w.CardInGame, attr: w.Attribute | 'cost'): number | undefined {
  const { stats, temporaryStatAdjustments } = objectOrCard;
  const value: number | undefined = (
    attr === 'cost' ?
      g.isObject(objectOrCard) ? objectOrCard.card.cost : objectOrCard.cost :
      stats?.[attr]
  );

  if (isUndefined(value)) {
    return undefined;
  } else if (temporaryStatAdjustments?.[attr]) {
    // Apply all temporary adjustments, one at a time, in order.
    return (temporaryStatAdjustments[attr] as w.StatAdjustment[])
      .reduce(
        (val: number | undefined, adj: { func: string }) =>
          clamp(eval(adj.func) as (x: number) => number)(val),   // eslint-disable-line no-eval
        value
      );
  } else {
    return value;
  }
}

/** Given a card, return its cost. */
export const getCost = (card: w.CardInGame): number => getAttribute(card, 'cost')!;

/** Return the number of spaces that a given robot is able to move this turn. */
export function movesLeft(robot: w.Robot): number {
  if (robot.cantMove || hasEffect(robot, 'cannotmove')) {
    return 0;
  } else {
    return getAttribute(robot, 'speed')! - robot.movesMade;
  }
}

/** Return whether a given object has the given effect type applied on it. */
export function hasEffect(object: w.Object, effect: w.EffectType): boolean {
  return some((object.effects || []), ['effect', effect]);
}

/** Return all effect instances of a given effect type on a given object.*/
function getEffect(object: w.Object, effect: w.EffectType): unknown[] {
  return (object.effects || new Array<w.Effect>())
    .filter((eff: w.Effect) => eff.effect === effect)
    .map((eff: w.Effect) => eff.props);
}

/** Return whether a given robot is able to attack a target hex this turn. */
function allowedToAttack(state: w.GameState, attacker: w.Robot, targetHex: Hex): boolean {
  const defender: w.Object = allObjectsOnBoard(state)[HexUtils.getID(targetHex)];

  if (!defender ||
    ownerOf(state, defender)!.color === ownerOf(state, attacker)!.color ||
    attacker.card.type !== TYPE_ROBOT ||
    attacker.cantAttack ||
    hasEffect(attacker, 'cannotattack') ||
    (getAttribute(attacker, 'attack') as number) <= 0) {
    return false;
  } else if (hasEffect(attacker, 'canonlyattack')) {
    const validTargetIds = flatMap(getEffect(attacker, 'canonlyattack'), (e) => (e as { target: w.ObjectCollection }).target.entries.map((t: w.Object) => t.id));
    return validTargetIds.includes(defender.id);
  } else {
    return true;
  }
}

/** Return whether a given object is able to activate any abilities this turn. */
export function canActivate(object: w.Object): boolean {
  return (object.activatedAbilities || []).length > 0 && !object.cantActivate && !hasEffect(object, 'cannotactivate');
}

/** Return whether the card type of a given object or card matches a CardTypeQuery. */
export function matchesType(objectOrCard: w.Object | w.CardInGame, cardTypeQuery: w.CardTypeQuery | w.CardTypeQuery[]): boolean {
  const card: w.CardInGame = ('card' in objectOrCard) ? objectOrCard.card : objectOrCard;
  const cardType = card.type;
  if (isArray(cardTypeQuery)) {
    return cardTypeQuery.map(stringToType).includes(cardType);
  } else if (['anycard', 'allobjects'].includes(cardTypeQuery)) {
    return true;
  } else {
    // note that 'event' is the old name for 'action'
    return stringToType(cardTypeQuery.replace('event', 'action')) === cardType;
  }
}

/** Returns true if the game cannot possibly end in a win anymore – no players have any cards left or any objects that can move, attack, or activate. */
// TODO unit-test this functionality!
export function isDrawByExhaustion(state: w.GameState): boolean {
  const { blue, orange } = state.players;
  const objectsOnBoard: w.Object[] = Object.values(allObjectsOnBoard(state));
  const numCardsLeft: number = blue.hand.length + blue.deck.length + orange.hand.length + orange.deck.length;
  return numCardsLeft === 0 && objectsOnBoard.every((obj) => !obj.stats.attack && !obj.stats.speed && !obj.activatedAbilities?.length);
}

/** Check if the game is over (by win or draw), and, if so, announce this. */
export function checkVictoryConditions(state: w.GameState): w.GameState {
  // Skip check if there's already a winner declared
  if (state.winner) { return state; }

  const blueKernelExists = some(state.players.blue.objectsOnBoard, { card: { type: TYPE_CORE } });
  const orangeKernelExists = some(state.players.orange.objectsOnBoard, { card: { type: TYPE_CORE } });

  if (!blueKernelExists && !orangeKernelExists) {
    state.winner = 'draw';
  } else if (!blueKernelExists) {
    state.winner = 'orange';
  } else if (!orangeKernelExists) {
    state.winner = 'blue';
  } else if (isDrawByExhaustion(state)) {
    state = logAction(state, null, 'Neither player is able to win in this position, so the game will end as a draw.');
    state.winner = 'draw';
  }

  if (state.winner) {
    const gameOverMsg = state.winner === 'draw' ? 'Draw game' : (state.winner === state.player ? ' win' : 'wins');
    state = triggerSound(state, state.winner === state.player ? 'win.wav' : 'game-over.wav');
    state = logAction(state, state.players[state.winner as w.PlayerColor], gameOverMsg);

    if (state.practice) {
      markAchievement('playedPracticeGame');
    }
  }

  return state;
}

/** Given a target that may be a card, object, or hex, return the appropriate card, if possible. */
function determineTargetCard(state: w.GameState, target: w.Targetable | null): w.CardInGame | null {
  if (!target || g.isPlayerState(target)) {
    return null;
  } else {
    const targetObj = (isString(target) ? allObjectsOnBoard(state)[target] : target);
    return g.isObject(targetObj) ? targetObj.card : targetObj;
  }
}

/** Given a game state, return true iff the current player has no valid actions
  * (i.e. playing cards, moving/attacking/activating objects) to perform. */
export function currentPlayerHasNoValidActions(state: w.GameState): boolean {
  const player: w.PlayerInGameState = currentPlayer(state);

  // Can the player play any cards?
  if (player.hand.some((card) => assertCardVisible(card).cost <= player.energy.available)) {
    return false;
  }

  // Can the player move, attack, or activate with any objects on the board?
  const objectHexes: Hex[] = Object.keys(player.objectsOnBoard).map(HexUtils.IDToHex);
  if (objectHexes.some((hex) => validActionHexes(state, hex).length > 0)) {
    return false;
  }

  return true;
}

/** Produce a `TargetReference` pointing to a `Target`. */
function getRefToTarget(target: w.Target): w.TargetReference {
  if (g.isCardCollection(target)) {
    return { type: 'cardIds', entries: target.entries.map(c => c.id) };
  } else if (g.isObjectCollection(target)) {
    return { type: 'objectIds', entries: target.entries.map(o => o.id) };
  } else if (g.isPlayerCollection(target)) {
    return { type: 'playerIds', entries: target.entries.map(p => p.color) };
  } else {
    return target;
  }
}

/** Materialize a `Target` from a `TargetReference`. */
function getTargetFromRef(state: w.GameState, target: w.TargetReference): w.Target {
  const { type, entries } = target;
  if (type === 'cardIds') {
    const cardsInHand = compact((entries as w.CardId[]).map((id) => getCardInHandById(state, id)));
    const cardsInDiscardPile = compact((entries as w.CardId[]).map((id) => getCardInDiscardPileById(state, id)));
    if (cardsInDiscardPile.length > 0) {
      return { type: 'cardsInDiscardPile', entries: cardsInDiscardPile };
    } else {
      return { type: 'cards', entries: cardsInHand };
    }
  } else if (type === 'objectIds') {
    return { type: 'objects', entries: compact((entries as w.ObjectId[]).map((id) => getObjectById(state, id))) };
  } else if (type === 'playerIds') {
    return { type: 'players', entries: [] };
  } else if (type === 'hexes') {
    return target as w.HexCollection;
  } else {
    const exhaustiveMatch: never = type;
    throw new Error(`Unexpected TargetReference type: ${exhaustiveMatch}`);
  }
}

//
// II. Grid-related helper functions.
//

/** Return all valid `HexId`s on the Wordbots board. */
export function allHexIds(): w.HexId[] {
  return GridGenerator.hexagon(3).map(HexUtils.getID);
}

/** Get the hex id corresponding to the given object, if any. */
export function getHex(state: w.GameState, object: w.Object): w.HexId | undefined {
  return findKey(allObjectsOnBoard(state), ['id', object.id]) || state.objectsDestroyedThisTurn[object.id]?.[0];
}

/** Given a Hex, return all adjacent Hexes on the board. */
export function getAdjacentHexes(hex: Hex): Hex[] {
  return [
    new Hex(hex.q, hex.r - 1, hex.s + 1),
    new Hex(hex.q, hex.r + 1, hex.s - 1),
    new Hex(hex.q - 1, hex.r + 1, hex.s),
    new Hex(hex.q + 1, hex.r - 1, hex.s),
    new Hex(hex.q - 1, hex.r, hex.s + 1),
    new Hex(hex.q + 1, hex.r, hex.s - 1)
  ].filter((adjacentHex) =>
    // Filter out hexes that are not on the 3-radius hex grid.
    allHexIds().includes(HexUtils.getID(adjacentHex))
  );
}

/** Return all valid placement Hexes for a given player to place a given object type. */
export function validPlacementHexes(state: w.GameState, playerName: w.PlayerColor, type: w.CardType): Hex[] {
  let hexes: Hex[] = new Array<Hex>();
  if (type === TYPE_ROBOT) {
    if (playerName === 'blue') {
      hexes = BLUE_PLACEMENT_HEXES.map(HexUtils.IDToHex);
    } else {
      hexes = ORANGE_PLACEMENT_HEXES.map(HexUtils.IDToHex);
    }
  } else if (type === TYPE_STRUCTURE) {
    const occupiedHexes: Hex[] = Object.keys(state.players[playerName].objectsOnBoard).map(HexUtils.IDToHex);
    hexes = flatMap(occupiedHexes, getAdjacentHexes);
  }

  return hexes.filter((hex) => !allObjectsOnBoard(state)[HexUtils.getID(hex)]);
}

/** Return all valid movement Hexes for an object on the given starting Hex. */
export function validMovementHexes(state: w.GameState, startHex: Hex): Hex[] {
  const object: w.Robot = allObjectsOnBoard(state)[HexUtils.getID(startHex)] as w.Robot;
  if (!object) {
    return [];
  }

  const impassableHexIds: w.HexId[] = flatMap(getEffect(object, 'cannotmoveto'), 'tiles.entries');

  let potentialMovementHexes = [startHex];

  times(movesLeft(object), () => {
    const newHexes = flatMap(potentialMovementHexes, getAdjacentHexes).filter((hex: Hex) =>
      !(impassableHexIds.includes(HexUtils.getID(hex))) &&
      (hasEffect(object, 'canmoveoverobjects') || !Object.keys(allObjectsOnBoard(state)).includes(HexUtils.getID(hex)))
    );

    potentialMovementHexes = uniqBy(potentialMovementHexes.concat(newHexes), HexUtils.getID);
  });

  return potentialMovementHexes.filter((hex) => !allObjectsOnBoard(state)[HexUtils.getID(hex)]);
}

/** Return all valid Hexes to attack for an object on the given starting Hex. */
export function validAttackHexes(state: w.GameState, startHex: Hex): Hex[] {
  const object: w.Robot = allObjectsOnBoard(state)[HexUtils.getID(startHex)] as w.Robot;
  if (!object) {
    return [];
  }

  const validMoveHexes = [startHex].concat(validMovementHexes(state, startHex));
  const potentialAttackHexes = uniqBy(flatMap(validMoveHexes, getAdjacentHexes), HexUtils.getID);

  return potentialAttackHexes.filter((hex) => allowedToAttack(state, object, hex));
}

/** Return all valid Hexes for any object actions (movement, attack, or activation),
  * for an object on the given starting Hex. */
export function validActionHexes(state: w.GameState, startHex: Hex): Hex[] {
  const object = allObjectsOnBoard(state)[HexUtils.getID(startHex)];
  if (!object) {
    return [];
  }

  const movementHexes = validMovementHexes(state, startHex);
  const attackHexes = validAttackHexes(state, startHex);
  const activateHexes = canActivate(object) ? [startHex] : [];

  return new Array<Hex>().concat(movementHexes, attackHexes, activateHexes);
}

/** Given an object that is about to attack a target Hex from a start Hex,
 *  return the intermediate Hex that it should move to to accomplish this attack, if possible. */
export function intermediateMoveHexId(state: w.GameState, startHex: Hex, attackHex: Hex): w.HexId | null {
  if (getAdjacentHexes(startHex).map(HexUtils.getID).includes(HexUtils.getID(attackHex))) {
    return null;
  } else {
    const adjacentHexIds = getAdjacentHexes(attackHex).map(HexUtils.getID);
    const movementHexIds = validMovementHexes(state, startHex).map(HexUtils.getID);
    return intersection(movementHexIds, adjacentHexIds)[0];
  }
}

//
// III. Effects on game state that are performed in many different places.
//

/** Trigger a sound effect by appending it to the sfx queue. */
export function triggerSound(state: w.GameState, filename: string): w.GameState {
  state.sfxQueue.push(filename);
  return state;
}

/** Log information about a some game action to the action log. */
export function logAction(
  state: w.GameState,
  player: w.PlayerInGameState | null,
  action: string,
  cards: Record<w.CardId, w.CardInGame> = {},
  timestamp: number | null = null,
  target: w.Targetable | null = null
): w.GameState {
  const playerStr = player ?
    (player.color === state.player ?
      'You ' :
      `${(state.usernames)[player.color]} `) :
    '';

  target = determineTargetCard(state, target);
  const targetStr = target ? `, targeting |${target.id}|` : '';
  const targetCards = target ? { [target.id]: target } : {};

  const message = {
    id: state.actionId!,
    user: '[Game]',
    text: `${playerStr}${action}${targetStr}.`,
    timestamp: timestamp || Date.now(),
    cards: { ...cards, ...targetCards }
  };

  // console.log(message.text);
  state.actionLog.push(message);
  return state;
}

/** Given a Targetable, return a string representing that Targetable that can be logged in a debug message. */
function targetToDebugStr(t: w.Targetable) {
  return g.isObject(t) ? t.card.name : (g.isCardInGame(t) ? t.name : (g.isPlayerState(t) ? t.color : t));
}

/**
 * Like logAction() but logging a debug message (visible only if debug mode is turned on by the player).
 * If targets are provided, they will be rendered using targetToDebugStr() and appended to the message.
 *
 * If verbose=true, the message will be logged only if it is the direct result of a player action,
 * versus due to a passive or triggered ability executing.
 * (This is a compromise between always displaying or never displaying verbose messages,
 * since they can completely overwhelm the chat sometimes.)
 * Note that if the ENABLE_ULTRA_VERBOSE_DEBUG_GAME_LOG constant is set to true,
 * verbose messages will *always* be logged, regardless of circumstance.
 */
export function logDebugMessage(state: w.GameState, text: string, targets?: w.Targetable[], verbose?: boolean): w.GameState {
  if (verbose && state.disableDebugVerboseLogging && !ENABLE_ULTRA_VERBOSE_DEBUG_GAME_LOG) {
    return state;
  }

  const message: w.LoggedAction = {
    id: generateId(), // state.actionId!,
    user: '[Debug]',
    text: `${text} ${targets ? `[${targets.map(targetToDebugStr).join(', ')}]` : ''}`,
    timestamp: Date.now(),
    cards: {}
  };

  state.actionLog.push(message);
  return state;
}

/**
 * Return a target and log it as a (verbose) debug message to the game log.
 * Note that these messages will not be logged for targets within triggered/passive abilities,
 * unless ENABLE_ULTRA_VERBOSE_DEBUG_GAME_LOG=true.
 */
export function logAndReturnTarget<T extends w.Target>(state: w.GameState, targetType: string, targetFn: () => T): T {
  const target = targetFn();
  state = logDebugMessage(state, `${targetType} = `, target.entries, true);
  return target;
}

/** Start a new game by resetting the game state, per the given game format. */
export function newGame(
  state: w.GameState,
  player: w.PlayerColor,
  usernames: w.PerPlayer<string>,
  decks: w.PerPlayer<w.PossiblyObfuscatedCard[]>,
  seed = 0,
  gameFormat: w.Format = DEFAULT_GAME_FORMAT,
  gameOptions: w.GameOptions = {}
): w.GameState {
  const format: GameFormat = GameFormat.decode(gameFormat);
  return format.startGame(state, player, usernames, decks, gameOptions, seed);
}

/** Pass the current player's turn, ending their turn and starting their opponent's turn. */
export function passTurn(state: w.GameState, player: w.PlayerColor): w.GameState {
  if (state.currentTurn === player) {
    state = logDebugMessage(state, `${player} passes, it is now ${opponent(player)}'s turn`);
    return startTurn(endTurn(state));
  } else {
    return state;
  }
}

/** Start the current player's turn. */
function startTurn(state: w.GameState): w.GameState {
  const player = currentPlayer(state);
  player.selectedCard = null;
  player.energy.total = Math.min(player.energy.total + 1, 10);
  player.energy.available = player.energy.total;
  player.objectsOnBoard = mapValues(player.objectsOnBoard, ((obj: w.Object) => ({
    ...obj,
    movesMade: 0,
    cantActivate: false,
    cantAttack: false,
    cantMove: false,
    attackedThisTurn: false,
    movedThisTurn: false,
    attackedLastTurn: (obj as w.Robot).attackedThisTurn,
    movedLastTurn: (obj as w.Robot).movedThisTurn
  })));

  state = drawCards(state, player, 1);
  state = triggerEvent(state, 'beginningOfTurn', { player: true });
  if (player.color === state.player) {
    state = triggerSound(state, 'yourmove.wav');
  }

  return state;
}

/** End the current player's turn (making their opponent the current player). */
function endTurn(state: w.GameState): w.GameState {
  function decrementDuration(ability: w.PassiveAbility | w.TriggeredAbility): w.PassiveAbility | w.TriggeredAbility | null {
    const duration: number | undefined = ability.duration;
    if (duration) {
      if (duration === 1) {
        // Time's up: Unapply the ability and remove it.
        if (g.isPassiveAbility(ability)) {
          unapplyAbility(state, ability);
        }
        return null;
      } else {
        return { ...ability, duration: duration ? duration - 1 : undefined };
      }
    } else {
      return ability;
    }
  }

  const previousTurnPlayer = currentPlayer(state);
  previousTurnPlayer.selectedCard = null;
  previousTurnPlayer.selectedTile = null;
  previousTurnPlayer.status.message = '';
  previousTurnPlayer.target = { choosing: false, chosen: null, possibleHexes: [], possibleCardsInHand: [], possibleCardsInDiscardPile: [] };
  previousTurnPlayer.objectsOnBoard = mapValues(previousTurnPlayer.objectsOnBoard, ((obj) => ({
    ...obj,
    attackedThisTurn: false,
    movedThisTurn: false,
    attackedLastTurn: ('attackedThisTurn' in obj) ? obj.attackedThisTurn : undefined,
    movedLastTurn: ('movedThisTurn' in obj) ? obj.movedThisTurn : undefined,
    tookDamageThisTurn: false,
    mostRecentlyInCombatWith: undefined,

    abilities: obj.abilities ? compact(obj.abilities.map(decrementDuration) as w.PassiveAbility[]) : [],
    triggers: obj.triggers ? compact(obj.triggers.map(decrementDuration) as w.TriggeredAbility[]) : []
  })));

  const nextTurnPlayer = opponentPlayer(state);
  nextTurnPlayer.objectsOnBoard = mapValues(nextTurnPlayer.objectsOnBoard, ((obj) => ({
    ...obj,
    abilities: compact((obj.abilities || new Array<w.Ability>()).map(decrementDuration)) as w.PassiveAbility[],
    triggers: compact((obj.triggers || new Array<w.Ability>()).map(decrementDuration)) as w.TriggeredAbility[]
  })));

  state = triggerEvent(state, 'endOfTurn', { player: true });
  state = checkVictoryConditions(state);
  state.currentTurn = opponentName(state);
  state.objectsDestroyedThisTurn = {};

  return state;
}

/** Draw the given number of cards for the given player, discarding cards drawn past the max hand size. */
export function drawCards(state: w.GameState, player: w.PlayerInGameState, count: number): w.GameState {
  const otherPlayer = state.players[opponent(player.color)];
  // Allow 1 extra card if an event is played (because that card will be discarded).
  const maxHandSize = MAX_HAND_SIZE + (state.eventExecuting ? 1 : 0);

  const numCardsDrawn = Math.min(count, maxHandSize - player.hand.length);
  const numCardsDiscarded = count - numCardsDrawn;

  times(numCardsDrawn, () => {
    const card = player.deck[0];
    if (card) {
      player.hand = [...player.hand, ...player.deck.splice(0, 1)];
      if (SharedDeckGameFormat.isActive(state)) {
        // In sharedDeck mode, drawing a card (or discarding the top card of the deck) affects both players' decks.
        otherPlayer.deck.splice(0, 1);
      }

      state = triggerEvent(state, 'afterCardDraw', {
        player: true,
        condition: (t: w.Trigger) => matchesType(card as w.CardInGame, t.cardType!)  // Hmm, how would this work with obfuscated cards?
      });
    }
  });

  times(numCardsDiscarded, () => {
    const card = player.deck[0];
    if (card) {
      player.deck.splice(0, 1);
      if (SharedDeckGameFormat.isActive(state)) {
        otherPlayer.deck.splice(0, 1);
      }
      state = putCardsInDiscardPile(state, player, [assertCardVisible(card)]);
      state = logAction(state, player, `had to discard a card due to having a full hand of ${MAX_HAND_SIZE} cards`);
    }
  });

  state = applyAbilities(state);
  return state;
}

/** Add the given cards to the given player's discard pile. */
function putCardsInDiscardPile(state: w.GameState, player: w.PlayerInGameState, cards: w.CardInGame[]): w.GameState {
  player.discardPile = [...player.discardPile, ...cards];

  cards.forEach((card) => {
    state = triggerEvent(state, 'afterCardEntersDiscardPile', {
      player: true,
      condition: (t: w.Trigger) => matchesType(card, t.cardType!)
    });
  });

  return state;
}

/** Move cards from a given player's hand to their discard pile.
  * Note: This is used to either play or discard a set of cards. */
export function discardCardsFromHand(state: w.GameState, color: w.PlayerColor, cards: w.CardInGame[]): w.GameState {
  const player = state.players[color];
  state = putCardsInDiscardPile(state, player, cards);
  state = removeCardsFromHand(state, cards, player);
  return state;
}

/** Remove given cards from the given player's hand. */
export function removeCardsFromHand(state: w.GameState, cards: w.CardInGame[], player: w.PlayerInGameState = currentPlayer(state)): w.GameState {
  const cardIds = cards.map((c) => c.id);
  player.hand = filter(player.hand, (c) => !cardIds.includes(c.id));
  return state;
}

/** Search and remove the given cards from each player's discard pile.
  * For each card found this way, call the given callback function. */
export function removeCardsFromDiscardPile(state: w.GameState, cards: w.CardInGame[], callback: (card: w.CardInGame) => void = noop): w.GameState {
  const discardPiles: w.CardInGame[][] = Object.values(state.players).map((player) => player.discardPile);

  cards.forEach((targetCard: w.CardInGame) => {
    discardPiles.forEach((discardPile: w.CardInGame[]) => {
      if (discardPile.find((card) => card.id === targetCard.id)) {
        remove(discardPile, { id: targetCard.id });
        callback(targetCard);
      }
    });
  });

  return state;
}

/** Deal X damage to the object at the given hex, from the specified source (if any). */
export function dealDamageToObjectAtHex(state: w.GameState, amount: number, hex: w.HexId, damageSourceObj: w.Object | null = null, cause: w.Cause | null = null): w.GameState {
  const object: w.Object | undefined = allObjectsOnBoard(state)[hex];

  if (object && !object.beingDestroyed) {
    state.memory['amount'] = amount;
    state = triggerEvent(state, 'afterDamageReceived', {
      object,
      condition: ((t) => !t.damageSourceCardType || stringToType(t.damageSourceCardType) === damageSourceObj?.card.type || t.damageSourceCardType === 'allobjects' || t.damageSourceCardType === 'anycard'),
      // calling the object dealing damage the "undergoer" feels silly semantically, but this is to support correct handling of "that" for things like
      //   "Whenever a robot deals damage to this object, *that robot* takes that much damage":
      undergoer: damageSourceObj || undefined
    }, (s) => {
      object.stats.health -= amount;
      object.tookDamageThisTurn = true;
      return logAction(s, null, `|${object.card.id}| received ${amount} damage`, { [object.card.id]: object.card });
    });

    // if damage happened outside of combat (so 'attack' sfx hasn't triggered), trigger the 'damage' sfx
    if (cause !== 'combat') {
      state = triggerSound(state, 'damage.wav');
    }
  }

  return updateOrDeleteObjectAtHex(state, object, hex, cause);
}

/** Check whether the object at the given hex has been destroyed, and update state accordingly.
  * Otherwise, just make sure that it's properly tracked in `objectsOnBoard` within the game state. */
export function updateOrDeleteObjectAtHex(
  state: w.GameState,
  object: w.Object | undefined,
  hex: w.HexId,
  cause: w.Cause | null = null,
  shouldApplyAbilities = true
): w.GameState {
  if (!object || allObjectsOnBoard(state)[hex]?.id !== object.id) {
    // Object no longer exists at this hex
    // perhaps it has already been deleted (or moved) by a previous effect in a chain of triggers?
    return state;
  }

  const ownerName = ownerOf(state, object)!.color;

  if ((getAttribute(object, 'health') as number) > 0 && !object.isDestroyed) {
    state.players[ownerName].objectsOnBoard[hex] = object;
    return state;
  } else if (!object.beingDestroyed) {
    object.beingDestroyed = true;

    state = triggerSound(state, 'destroyed.wav');
    state = logAction(state, null, `|${object.card.id}| was destroyed`, { [object.card.id]: object.card });
    state = triggerEvent(state, 'afterDestroyed', { object, condition: ((t: w.Trigger) => (t.cause === cause || t.cause === 'anyevent')) });
    if (cause === 'combat' && object.mostRecentlyInCombatWith) {
      state = triggerEvent(state, 'afterDestroysOtherObject', {
        object: getObjectById(state, object.mostRecentlyInCombatWith),
        condition: ((t: w.Trigger) => matchesType(object.card, t.cardType!))
      });
    }

    // Check if the object is still there, because the afterDestroyed trigger may have,
    // e.g., returned it to its owner's hand.
    if (allObjectsOnBoard(state)[hex]?.id === object.id) {
      const card = state.players[ownerName].objectsOnBoard[hex].card;
      state = removeObjectFromBoard(state, object, hex);
      state = discardCardsFromHand(state, state.players[ownerName].color, [card]);
    }

    return shouldApplyAbilities ? applyAbilities(state) : state;
  } else {
    return state;
  }
}

/** Look over all objects on the board, delete any that were destroyed, and then apply abilities in a single pass. */
export function deleteAllDyingObjects(state: w.GameState): w.GameState {
  const objects: Array<[w.HexId, w.Object]> = Object.entries(allObjectsOnBoard(state));

  state = objects.reduce<w.GameState>((currentState, [hex, object]) => (
    updateOrDeleteObjectAtHex(currentState, object, hex, null, false)
  ), state);
  // applyAbilities in one pass rather than for each updateOrDeleteObjectAtHex() call
  state = applyAbilities(state);

  return state;
}

/** Remove an object from the board, unapplying the effects of its abilities (if any) */
export function removeObjectFromBoard(state: w.GameState, object: w.Object, hex: w.HexId): w.GameState {
  const ownerName: w.PlayerColor = (ownerOf(state, object) as w.PlayerInGameState).color;

  delete state.players[ownerName].objectsOnBoard[hex];

  // Unapply any abilities that this object had.
  object.abilities.forEach((ability) => unapplyAbility(state, ability));

  state.objectsDestroyedThisTurn[object.id] = [hex, ownerName];

  state = applyAbilities(state);
  state = checkVictoryConditions(state);
  return state;
}

/** Reset any state that was set purely for animation purposes (i.e. damage animation). */
export function cleanUpAnimations(state: w.GameState): w.GameState {
  const cleanup = (obj: w.Object): w.Object => ({ ...obj, tookDamageThisTurn: false });

  state.players['blue'].objectsOnBoard = mapValues(state.players['blue'].objectsOnBoard, cleanup);
  state.players['orange'].objectsOnBoard = mapValues(state.players['orange'].objectsOnBoard, cleanup);
  return state;
}

/** Given a selected target, track that target in game state and execute `state.callbackAfterTargetSelected`.
  * This happens when card behavior needs to wait for target selection by the player to proceed. */
export function setTargetAndExecuteQueuedAction(state: w.GameState, target: w.CardInGame | w.HexId): w.GameState {
  const player: w.PlayerInGameState = currentPlayer(state);
  const targets: Array<w.CardInGame | w.HexId> = (player.target.chosen || []).concat([target]);

  // Select target tile for event or afterPlayed trigger.
  player.target = {
    chosen: targets,
    choosing: false,
    possibleHexes: [],
    possibleCardsInHand: [],
    possibleCardsInDiscardPile: []
  };

  // Perform the trigger (in a temp state because we may need more targets yet).
  const tempState: w.GameState = state.callbackAfterTargetSelected!(state);

  if (tempState.players[player.color].target.choosing) {
    // Still need more targets!
    // So we revert to old state but use new target selection properties.
    state.players[player.color].target = { ...tempState.players[player.color].target, chosen: targets };

    return state;
  } else {
    // We have all the targets we need and we're good to go.
    // Reset target and return new state.
    tempState.callbackAfterTargetSelected = undefined;
    tempState.players[player.color].target = defaultTarget();
    tempState.players[player.color].status.message = '';

    return tempState;
  }
}

//
// IV. Card behavior: actions, triggers, passive abilities.
//

/** Execute the given command (from card action, card ability, activated ability, etc.),
  * potentially in the context of a given object,
  * by building a vocabulary dictionary and eval()ing the command in its context,
  * handling things like thrown errors and infinite execution loops along the way. */
export function executeCmd(
  state: w.GameState,
  cmd: ((s: w.GameState) => void) | w.StringRepresentationOf<(s: w.GameState) => void>,
  currentObject: w.Object | null = null,
  itOverride: w.Object | null = null,
  source: w.AbilityId | null = null
): w.GameState | w.Target | number {
  // console.log(cmd);
  state = logDebugMessage(
    state,
    `Executing command ${source ? ` (for ability #${source})` : ''} "${state.currentCmdText}" (currentObject: ${currentObject?.card.name || '(null)'}):\n ${cmd}`,
    [],
    true
  );

  state.callbackAfterExecution = undefined;

  state.executionStackDepth += 1;
  if (state.executionStackDepth >= MAX_EXECUTION_STACK_SIZE) {
    throw new Error('EXECUTION_STACK_DEPTH_EXCEEDED');
  }

  const vocabulary = buildVocabulary(state, currentObject, itOverride, source);
  const [terms, definitions] = [Object.keys(vocabulary), Object.values(vocabulary)];
  const wrappedCmd = `(function (${terms.join(',')}) { return (${cmd})(); })`;

  try {
    const result = eval(wrappedCmd)(...definitions);  // eslint-disable-line no-eval
    state.executionStackDepth -= 1;
    return result;
  } catch (error) {
    if (isErrorWithMessage(error) && error.message === 'EXECUTION_STACK_DEPTH_EXCEEDED') {
      // Propagate the error up the stack to the original invocation of executeCmd() (executionStackDepth === 1).
      if (state.executionStackDepth > 1) {
        throw error;
      } else {
        // Once we've reached the top of the stack, log the error and end the game in a draw (because ¯\_(ツ)_/¯ ).
        console.error('Execution stack depth exceeded!');
        state.winner = 'draw';
        state = triggerSound(state, 'game-over.wav');
        state = logAction(state, null, 'Infinite loop detected - the game ends in a draw.');
        return state;
      }
    } else {
      // Note that errors may be handled further up the stack (i.e. see executeCmdAndLogErrors)
      throw error;
    }
  }
}

/**
 * Wraps `executeCmd` in an exception handler that
 * just logs any errors to the game log and suppresses them otherwise.
 * The idea is that this is what we call instead of executeCmd() when
 * execution is happening *not* as the result of a player action and cannot be avoided
 * (i.e. a triggered or passive ability). */
export function executeCmdAndLogErrors<T = void>(
  state: w.GameState,
  cmd: ((s: w.GameState) => void) | w.StringRepresentationOf<(s: w.GameState) => void>,
  currentObject: w.Object | null = null,
  itOverride: w.Object | null = null,
  source: w.AbilityId | null = null,
  fallbackReturn?: T
): T {
  try {
    // Note that we don't want to log debug messages for execution happening for triggered/passive abilities because it can get VERY wordy.
    // Note also that the ENABLE_ULTRA_VERBOSE_DEBUG_GAME_LOG constant can be set to true to log these things regardless.
    state.disableDebugVerboseLogging = true;

    return executeCmd(state, cmd, currentObject, itOverride, source) as unknown as T;
  } catch (error) {
    if (isErrorWithMessage(error) && error.message === 'EXECUTION_STACK_DEPTH_EXCEEDED') {
      throw error;
    } else {
      logAction(state, null, `Runtime exception while handling an ability (report this to the developers):\ncard name: ${currentObject?.card.name || 'null'}\ncommand: ${state.currentCmdText || 'null'}`);
      return fallbackReturn || (undefined as unknown as T);
    }
  } finally {
    state.disableDebugVerboseLogging = false;
  }
}

/** Trigger an event of a given trigger type, executing all matching triggers on the board,
  * and potentially overriding default behavior of the event (i.e. if there is an Instead clause) */
export function triggerEvent(
  state: w.GameState,
  triggerType: string,
  target: w.EventTarget,
  defaultBehavior: null | ((s: w.GameState) => w.GameState) = null
): w.GameState {
  // Formulate the trigger condition.
  const defaultCondition = ((t: w.Trigger) => (target.condition ? target.condition(t) : true));
  let condition: ((t: w.Trigger) => boolean) = defaultCondition;

  if (target.object) {
    state = { ...state, it: target.object };
    condition = ((t: w.Trigger) =>
      (t.targets as w.ObjectsTargetRef).entries.includes(target.object!.id) && defaultCondition(t)
    );
  } else if (target.player) {
    state = { ...state, itP: currentPlayer(state) };
    condition = ((t: w.Trigger) =>
      (t.targets as w.PlayersTargetRef).entries.includes(state.currentTurn) && defaultCondition(t)
    );
  }
  if (target.undergoer) {
    // Also store the undergoer (as opposed to agent) of the event if present.
    // (see https://en.wikipedia.org/wiki/Patient_(grammar) )
    state = { ...state, that: target.undergoer };
  }

  // Look up any relevant triggers for this condition.
  const triggers = flatMap(Object.values(allObjectsOnBoard(state)), ((object: w.Object) =>
    (object.triggers || new Array<w.TriggeredAbility>())
      .map((t: w.TriggeredAbility) => {
        // Assign t.trigger.targets (used in testing the condition) and t.object (used in executing the action).
        t.trigger.targets = getRefToTarget(
          executeCmdAndLogErrors<w.Target>(state, t.trigger.targetFunc, object, null, null, { type: 'objects', entries: [] })
        );
        return { ...t, object };
      })
      .filter((t) => t.trigger.type === triggerType && condition(t.trigger))
  ));

  // Execute the defaultBehavior of the event (if any), unless any of the triggers overrides it.
  // Note: At the moment, only afterAttack events can be overridden.
  if (defaultBehavior && !some(triggers, 'override')) {
    state = defaultBehavior(state);
  }

  // Now execute each trigger.
  triggers.forEach((t: w.TriggeredAbility & { object: w.Object }) => {
    // Ordinarily, currentObject has higher salience than state.it for determining it()
    //     (see it() in vocabulary/targets.js)
    // but we actually want the opposite behavior when processing a trigger!
    // For example, when the trigger is:
    //     Arena: Whenever a robot is destroyed in combat, deal 1 damage to its controller.
    //         state.it = (destroyed robot)
    //         t.object = Arena
    //         "its controller" should = (destroyed robot)
    const itOverride: w.Object | null = (state.it && g.isObject(state.it) ? (state.it) : null);

    state.currentCmdText = t.text || undefined;
    state = logDebugMessage(state, `Activating ${triggerType} trigger for ${t.object.card.name} ...`);
    executeCmdAndLogErrors(state, t.action, t.object, itOverride);

    if (state.callbackAfterExecution) {
      state = state.callbackAfterExecution(state);
    }
  });

  state = applyAbilities(state);
  return { ...state, it: undefined, itP: undefined, that: undefined };
}

/** Refresh all passive abilities on the game board, by first unapplying and then applying each of them. */
export function applyAbilities(state: w.GameState): w.GameState {
  Object.values(allObjectsOnBoard(state)).forEach((obj) => {
    obj.abilities.forEach((ability) => {
      // Determine what entities match this ability's targeting criteria, if any.
      const newTarget: w.TargetReference | null = (
        ability.disabled
          ? null
          : getRefToTarget(
            executeCmdAndLogErrors<w.Target>(state, ability.targets, obj, null, null, { type: 'objects', entries: [] })
          )
      );

      // If the ability's targets have changed since last time it applied (or it's disabled, etc):
      if (!isEqual(newTarget, ability.currentTargets)) {
        // console.log(`Reapplying abilities of ${obj.id} ${obj.card.name} - new target =`, newTarget);

        state = logDebugMessage(state, `(Re)applying abilities for ${obj.card.name} ...`);
        // Unapply this ability for all previously targeted objects (if any).
        unapplyAbility(state, ability);
        // And apply this ability to its new set of targets (if any).
        applyAbility(state, ability, newTarget);
      }
    });

    obj.abilities = obj.abilities.filter((ability) => !ability.disabled);
  });

  state = checkVictoryConditions(state);
  return state;
}

/** Apply an ability to a set of targets. */
function applyAbility(state: w.GameState, ability: w.PassiveAbility, target: w.TargetReference | null) {
  if (target) {
    // console.log(`Applying ability ${ability.aid} "${ability.text}" to`, target);

    ability.currentTargets = target;
    const targetedEntries: w.Targetable[] = getTargetFromRef(state, target).entries;
    state = logDebugMessage(state, `Applying ability "${ability.text}" (#${ability.aid}) to:`, targetedEntries);

    if (targetedEntries.length > 0) {
      targetedEntries.forEach(ability.apply);
      if (ability.onlyExecuteOnce) {
        ability.disabled = true;
      }
    }
  }
}

/** Unapply an ability from its current set of targets. */
function unapplyAbility(state: w.GameState, ability: w.PassiveAbility): void {
  if (ability.currentTargets) {
    // console.log(`Unapplying ability ${ability.aid} "${ability.text}" from`, ability.currentTargets);
    const targetedEntries: w.Targetable[] = getTargetFromRef(state, ability.currentTargets).entries;
    targetedEntries.forEach(ability.unapply);
  }
}

/** Reverse all `setAbility` or `setTrigger` clauses in given command tetx (used for unapplying abilities). */
export function reversedCmd(cmd: string): string {
  return cmd.replace(/setAbility/g, 'unsetAbility')
    .replace(/setTrigger/g, 'unsetTrigger');
}
