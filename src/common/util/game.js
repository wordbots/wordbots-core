import { cloneDeep, filter, findKey, flatMap, isArray, mapValues, some, without } from 'lodash';
import seededRNG from 'seed-random';

import { TYPE_ROBOT, TYPE_STRUCTURE, TYPE_CORE, stringToType } from '../constants';
import defaultState, { bluePlayerState, orangePlayerState, arbitraryPlayerState } from '../store/defaultGameState';
import buildVocabulary from '../vocabulary/vocabulary';
import GridGenerator from '../components/react-hexgrid/GridGenerator';
import Hex from '../components/react-hexgrid/Hex';
import HexUtils from '../components/react-hexgrid/HexUtils';

import { clamp } from './common';

//
// I. Queries for game state.
//

export function opponent(playerName) {
  return (playerName === 'blue') ? 'orange' : 'blue';
}

export function opponentName(state) {
  return opponent(state.currentTurn);
}

export function activePlayer(state) {
  return state.players[state.player];
}

export function currentPlayer(state) {
  return state.players[state.currentTurn];
}

export function opponentPlayer(state) {
  return state.players[opponentName(state)];
}

export function allObjectsOnBoard(state) {
  return Object.assign({}, state.players.blue.robotsOnBoard, state.players.orange.robotsOnBoard);
}

export function ownerOf(state, object) {
  if (some(state.players.blue.robotsOnBoard, o => o.id === object.id)) {
    return state.players.blue;
  } else if (some(state.players.orange.robotsOnBoard, o => o.id === object.id)) {
    return state.players.orange;
  }
}

export function getAttribute(object, attr) {
  if (object.temporaryStatAdjustments && object.temporaryStatAdjustments[attr]) {
    // Apply all temporary adjustments, one at a time, in order.
    return object.temporaryStatAdjustments[attr].reduce((val, adj) => clamp(adj.func)(val), object.stats[attr]);
  } else {
    return (object.stats[attr] === undefined) ? undefined : object.stats[attr];
  }
}

export function movesLeft(robot) {
  return robot.cantMove ? 0 : getAttribute(robot, 'speed') - robot.movesMade;
}

export function getCost(card) {
  if (card.temporaryStatAdjustments && card.temporaryStatAdjustments.cost) {
    // Apply all temporary adjustments, one at a time, in order.
    return card.temporaryStatAdjustments.cost.reduce((val, adj) => clamp(adj.func)(val), card.cost);
  } else {
    return card.cost;
  }
}

export function hasEffect(object, effect) {
  return some((object.effects || []), eff => eff.effect === effect);
}

function getEffect(object, effect) {
  return (object.effects || []).filter(eff => eff.effect === effect).map(eff => eff.props);
}

export function allowedToAttack(state, attacker, targetHex) {
  if (attacker.cantAttack || hasEffect(attacker, 'cannotattack')) {
    return false;
  } else if (hasEffect(attacker, 'canonlyattack')) {
    const defender = allObjectsOnBoard(state)[targetHex];
    if (defender) {
      const validTargetIds = flatMap(getEffect(attacker, 'canonlyattack'), e => e.target.entries.map(t => t.id));
      return validTargetIds.includes(defender.id);
    }
  } else {
    return true;
  }
}

export function matchesType(objectOrCard, cardTypeQuery) {
  const cardType = objectOrCard.card ? objectOrCard.card.type : objectOrCard.type;
  if (['anycard', 'allobjects'].includes(cardTypeQuery)) {
    return true;
  } else if (isArray(cardTypeQuery)) {
    return cardTypeQuery.map(stringToType).includes(cardType);
  } else {
    return stringToType(cardTypeQuery) === cardType;
  }
}

export function checkVictoryConditions(state) {
  if (!some(state.players.blue.robotsOnBoard, o => o.card.type === TYPE_CORE)) {
    state.winner = 'orange';
  } else if (!some(state.players.orange.robotsOnBoard, o => o.card.type === TYPE_CORE)) {
    state.winner = 'blue';
  }

  return state;
}

//
// II. Grid-related helper functions.
//

export function allHexIds() {
  return GridGenerator.hexagon(3).map(HexUtils.getID);
}

export function getHex(state, object) {
  return findKey(allObjectsOnBoard(state), ['id', object.id]);
}

export function getAdjacentHexes(hex) {
  return [
    new Hex(hex.q, hex.r - 1, hex.s + 1),
    new Hex(hex.q, hex.r + 1, hex.s - 1),
    new Hex(hex.q - 1, hex.r + 1, hex.s),
    new Hex(hex.q + 1, hex.r - 1, hex.s),
    new Hex(hex.q - 1, hex.r, hex.s + 1),
    new Hex(hex.q + 1, hex.r, hex.s - 1)
  ].filter(adjacentHex =>
    // Filter out hexes that are not on the 3-radius hex grid.
    allHexIds().includes(HexUtils.getID(adjacentHex))
  );
}

export function validPlacementHexes(state, playerName, type) {
  let hexes;
  if (type === TYPE_ROBOT) {
    if (playerName === 'blue') {
      hexes = ['-2,-1,3', '-2,0,2', '-3,1,2'].map(HexUtils.IDToHex);
    } else {
      hexes = ['3,-1,-2', '2,0,-2', '2,1,-3'].map(HexUtils.IDToHex);
    }
  } else if (type === TYPE_STRUCTURE) {
    const occupiedHexes = Object.keys(state.players[playerName].robotsOnBoard).map(HexUtils.IDToHex);
    hexes = flatMap(occupiedHexes, getAdjacentHexes);
  }

  return hexes.filter(hex => !allObjectsOnBoard(state)[HexUtils.getID(hex)]);
}

export function validMovementHexes(state, startHex, speed, object) {
  let validHexes = [startHex];

  for (let distance = 0; distance < speed; distance++) {
    const newHexes = flatMap(validHexes, getAdjacentHexes).filter(hex =>
      hasEffect(object, 'canmoveoverobjects') || !Object.keys(allObjectsOnBoard(state)).includes(HexUtils.getID(hex))
    );

    validHexes = validHexes.concat(newHexes);
  }

  validHexes = validHexes.filter(hex => !allObjectsOnBoard(state)[HexUtils.getID(hex)]);

  return without(validHexes, startHex);
}

export function validAttackHexes(state, playerName, startHex, speed, object) {
  const validMoveHexes = [startHex].concat(validMovementHexes(state, startHex, speed - 1, object));
  const potentialAttackHexes = flatMap(validMoveHexes, getAdjacentHexes);

  return potentialAttackHexes.filter((hex) =>
    Object.keys(state.players[opponent(playerName)].robotsOnBoard).includes(HexUtils.getID(hex))
  );
}

//
// III. Effects on game state that are performed in many different places.
//

export function logAction(state, player, action, cards, timestamp) {
  const playerStr = player ? (player.name === state.player ? 'You ' : `${state.usernames[player.name]} `) : '';
  const message = {
    id: state.actionId,
    user: '[Game]',
    text: `${playerStr}${action}.`,
    timestamp: timestamp || Date.now(),
    cards: cards
  };

  state.actionLog.push(message);
  return state;
}

export function newGame(state, player, usernames, decks, seed) {
  state = Object.assign(state, cloneDeep(defaultState), {player: player, rng: seededRNG(seed)}); // Reset game state.
  state.usernames = usernames;
  state.players.blue = bluePlayerState(decks.blue);
  state.players.orange = orangePlayerState(decks.orange);
  state.started = true;
  return state;
}

export function startTurn(state) {
  const player = currentPlayer(state);
  player.energy.total = Math.min(player.energy.total + 1, 10);
  player.energy.available = player.energy.total;
  player.robotsOnBoard = mapValues(player.robotsOnBoard, (robot =>
    Object.assign({}, robot, {
      movesMade: 0,
      cantActivate: false,
      cantAttack: false,
      cantMove: false,
      attackedThisTurn: false,
      movedThisTurn: false,
      attackedLastTurn: robot.attackedThisTurn,
      movedLastTurn: robot.movedThisTurn
    })
  ));

  state = drawCards(state, player, 1);
  state = triggerEvent(state, 'beginningOfTurn', {player: true});

  return state;
}

export function endTurn(state) {
  const player = currentPlayer(state);
  player.selectedCard = null;
  player.selectedTile = null;
  player.status.message = '';
  player.target = {choosing: false, chosen: null, possibleHexes: [], possibleCards: []};
  player.robotsOnBoard = mapValues(player.robotsOnBoard, (robot =>
    Object.assign({}, robot, {
      attackedThisTurn: false,
      movedThisTurn: false,
      attackedLastTurn: robot.attackedThisTurn,
      movedLastTurn: robot.movedThisTurn
    })
  ));

  state = triggerEvent(state, 'endOfTurn', {player: true});
  state.currentTurn = opponentName(state);
  state.hoveredCardIdx = null;

  return state;
}

export function drawCards(state, player, count) {
  player.hand = player.hand.concat(player.deck.splice(0, count));
  state = applyAbilities(state);
  return state;
}

// Note: This is used to either play or discard a set of cards.
export function discardCards(state, cards) {
  // At the moment, only the currently active player can ever play or discard a card.
  const player = currentPlayer(state);
  const cardIds = cards.map(c => c.id);
  player.hand = filter(player.hand, c => !cardIds.includes(c.id));
  return state;
}

export function dealDamageToObjectAtHex(state, amount, hex, cause = null) {
  const object = allObjectsOnBoard(state)[hex];

  if (!object.beingDestroyed) {
    object.stats.health -= amount;
    state = logAction(state, null, `|${object.card.name}| received ${amount} damage`, {[object.card.name]: object.card});
    state = triggerEvent(state, 'afterDamageReceived', {object: object});
  }

  return updateOrDeleteObjectAtHex(state, object, hex, cause);
}

export function updateOrDeleteObjectAtHex(state, object, hex, cause = null) {
  const ownerName = ownerOf(state, object).name;

  if (getAttribute(object, 'health') > 0 && !object.isDestroyed) {
    state.players[ownerName].robotsOnBoard[hex] = object;
  } else if (!object.beingDestroyed) {
    object.beingDestroyed = true;

    state = logAction(state, null, `|${object.card.name}| was destroyed`, {[object.card.name]: object.card});
    state = triggerEvent(state, 'afterDestroyed', {object: object, condition: (t => (t.cause === cause || t.cause === 'anyevent'))});

    delete state.players[ownerName].robotsOnBoard[hex];

    // Unapply any abilities that this object had.
    (object.abilities || [])
      .filter(ability => ability.currentTargets)
      .forEach(ability => { ability.currentTargets.entries.forEach(ability.unapply); });

    state = checkVictoryConditions(state);
  }

  state = applyAbilities(state);

  return state;
}

export function setTargetAndExecuteQueuedAction(state, target) {
  const player = currentPlayer(state);
  const targetCard = allObjectsOnBoard(state)[target] ? allObjectsOnBoard(state)[target].card : (target.card || target);

  // Select target tile for event or afterPlayed trigger.
  player.target = {
    chosen: [target],
    choosing: false,
    possibleHexes: [],
    possibleCards: []
  };

  // Perform the trigger.
  state = state.callbackAfterTargetSelected(state);
  state = logAction(state, null, `|${targetCard.name}| was targeted`, {[targetCard.name]: targetCard});
  state.callbackAfterTargetSelected = null;

  // Reset target.
  state.players[player.name].target = arbitraryPlayerState().target;

  return state;
}

//
// IV. Card behavior: actions, triggers, passive abilities.
//

export function executeCmd(state, cmd, currentObject = null, source = null) {
  // console.log(cmd);

  const vocabulary = buildVocabulary(state, currentObject, source);
  const [terms, definitions] = [Object.keys(vocabulary), Object.values(vocabulary)];

  const wrappedCmd = `(function (${terms.join(',')}) { return (${cmd})(); })`;
  return eval(wrappedCmd)(...definitions);
}

export function triggerEvent(state, triggerType, target = {}, defaultBehavior = null) {
  // Formulate the trigger condition.
  const defaultCondition = (t => (target.condition ? target.condition(t) : true));
  let condition = defaultCondition;
  if (target.object) {
    state = Object.assign({}, state, {it: target.object});
    condition = (t => t.targets.map(o => o.id).includes(target.object.id) && defaultCondition(t));
  } else if (target.player) {
    state = Object.assign({}, state, {itP: currentPlayer(state)});
    condition = (t => t.targets.map(p => p.name).includes(state.currentTurn) && defaultCondition(t));
  }

  // Look up any relevant triggers for this condition.
  const triggers = flatMap(Object.values(allObjectsOnBoard(state)), (object =>
    object.triggers
      .map(t => {
        // Assign t.trigger.targets (used in testing the condition) and t.object (used in executing the action).
        t.trigger.targets = executeCmd(state, t.trigger.targetFunc, object).entries;
        return Object.assign({}, t, {object: object});
      })
      .filter(t => t.trigger.type === triggerType && condition(t.trigger))
  ));

  // Execute the defaultBehavior of the event (if any), unless any of the triggers overrides it.
  // Note: At the moment, only afterAttack events can be overridden.
  if (defaultBehavior && !some(triggers, t => t.override)) {
    state = defaultBehavior(state);
  }

  // Now execute each trigger.
  triggers.forEach(t => {
    // Ordinarily, currentObject has higher salience than state.it
    //     (see it() in vocabulary/targets.js)
    // but we actually want the opposite behavior when processing a trigger!
    // For example, when the trigger is:
    //     Arena: Whenever a robot is destroyed in combat, deal 1 damage to its controller.
    //         state.it = (destroyed robot)
    //         t.object = Arena
    //         "its controller" should = (destroyed robot)
    const currentObject = state.it || t.object;
    executeCmd(state, t.action, currentObject);
  });

  return Object.assign({}, state, {it: null, itP: null});
}

export function applyAbilities(state) {
  Object.values(allObjectsOnBoard(state)).forEach(obj => {
    obj.abilities.forEach(ability => {
      // Unapply this ability for all previously targeted objects.
      if (ability.currentTargets) {
        ability.currentTargets.entries.forEach(ability.unapply);
      }

      if (!ability.disabled) {
        // Apply this ability to all targeted objects.
        // console.log(`Applying ability of ${obj.card.name} to ${ability.targets}`);
        ability.currentTargets = executeCmd(state, ability.targets, obj);
        ability.currentTargets.entries.forEach(ability.apply);
      }
    });

    obj.abilities = obj.abilities.filter(ability => !ability.disabled);
  });

  return state;
}

export function reversedCmd(cmd) {
  return cmd.replace(/setAbility/g, 'unsetAbility')
            .replace(/setTrigger/g, 'unsetTrigger');
}
