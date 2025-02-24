import { cloneDeep } from 'lodash';

import HexUtils from '../../../components/hexgrid/HexUtils';
import { stringToType } from '../../../constants';
import * as w from '../../../types';
import { inBrowser, inTest } from '../../../util/browser';
import {
  allObjectsOnBoard, applyAbilities, canActivate, checkVictoryConditions, currentPlayer,
  dealDamageToObjectAtHex, executeCmd, getAttribute, hasEffect, logAction,
  matchesType,
  opponentPlayer, ownerOf, playerAction, setTargetAndExecuteQueuedAction, triggerEvent, triggerSound,
  updateOrDeleteObjectAtHex, validAttackHexes, validMovementHexes
} from '../../../util/game';

type State = w.GameState;
type PlayerState = w.PlayerInGameState;

function selectTile(state: State, tile: w.HexId | null): State {
  currentPlayer(state).selectedTile = tile;
  currentPlayer(state).selectedCard = null;
  return state;
}

function resetTargetAndStatus(player: PlayerState): void {
  player.status = { message: '', type: '' };
  player.target = { choosing: false, chosen: null, numChoosing: 0, possibleCardsInHand: [], possibleCardsInDiscardPile: [], possibleHexes: [] };
}

export function deselect(state: State, playerColor: w.PlayerColor = state.currentTurn): State {
  const player = state.players[playerColor];
  player.selectedTile = null;
  player.selectedCard = null;
  resetTargetAndStatus(player);
  return state;
}

export function setSelectedTile(state: State, playerColor: w.PlayerColor, tile: w.HexId): State {
  playerAction();

  const player = state.players[playerColor];
  const isCurrentPlayer = (playerColor === state.currentTurn);

  if (isCurrentPlayer &&
    player.target.choosing &&
    player.target.possibleHexes.includes(tile) &&
    (player.selectedCard !== null || state.callbackAfterTargetSelected !== null)) {
    // Target chosen for a queued action.
    return setTargetAndExecuteQueuedAction(state, tile);
  } else {
    // Toggle tile selection.
    player.selectedTile = (player.selectedTile === tile) ? null : tile;
    player.selectedCard = null;
    resetTargetAndStatus(player);
    return state;
  }
}

export function moveRobot(state: State, fromHex: w.HexId, toHex: w.HexId): State {
  playerAction();

  const player: PlayerState = state.players[state.currentTurn];
  const movingRobot: w.Object = player.objectsOnBoard[fromHex];

  if (player.target.choosing) {
    // If the player is in target-selection mode, just get out of that mode instead.
    resetTargetAndStatus(player);
    return state;
  }

  // Is the move valid?
  const validHexes = validMovementHexes(state, HexUtils.IDToHex(fromHex));
  if (validHexes.map(HexUtils.getID).includes(toHex)) {
    const distance = HexUtils.IDToHex(toHex).distance(HexUtils.IDToHex(fromHex));
    movingRobot.movesMade += distance;
    movingRobot.movedThisTurn = true;

    state = triggerSound(state, 'move.wav');
    state = logAction(state, player, `moved |${movingRobot.card.id}|`, { [movingRobot.card.id]: movingRobot.card });
    state = transportObject(state, fromHex, toHex);
    state = triggerEvent(state, 'afterMove', { object: movingRobot });
    state = applyAbilities(state);
    state = updateOrDeleteObjectAtHex(state, movingRobot, toHex);
    state = deselect(state);
  }

  return state;
}

// "Move an object" abilities don't care if that object is able to move itself,
// so the process for moving is simpler.
export function moveObjectUsingAbility(state: State, fromHex: w.HexId, toHex: w.HexId): State {
  // Is the space unoccuplied?
  if (!allObjectsOnBoard(state)[toHex]) {
    const movingRobot: w.Object = allObjectsOnBoard(state)[fromHex];

    state = logAction(state, null, `|${movingRobot.card.id}| was moved`, { [movingRobot.card.id]: movingRobot.card });
    state = transportObject(state, fromHex, toHex);
    state = applyAbilities(state);
    state = updateOrDeleteObjectAtHex(state, movingRobot, toHex);
  }

  return state;
}

export function attack(state: State, source: w.HexId, target: w.HexId): State {
  // TODO: All attacks are "melee" for now.
  // In the future, there will be ranged attacks that work differently.

  const player: PlayerState = currentPlayer(state);
  const opponent: PlayerState = opponentPlayer(state);

  const attacker: w.Robot = player.objectsOnBoard[source] as w.Robot;
  const defender: w.Object = opponent.objectsOnBoard[target];

  if (player.target.choosing) {
    // If the player is in target-selection mode, just get out of that mode instead.
    resetTargetAndStatus(player);
    return state;
  }

  if (attacker) {
    // Is the attack valid?
    const validHexes = validAttackHexes(state, HexUtils.IDToHex(source));
    if (validHexes.map(HexUtils.getID).includes(target)) {
      attacker.cantMove = true;
      attacker.cantAttack = true;
      attacker.cantActivate = true;
      attacker.attackedThisTurn = true;

      state = triggerSound(state, 'attack.wav');
      state = logAction(state, player, `attacked |${defender.card.id}| with |${attacker.card.id}|`, {
        [defender.card.id]: defender.card,
        [attacker.card.id]: attacker.card
      });
      state.attack = { from: source, to: target };
      state = deselect(state);
    }
  }

  return state;
}

// For animation purposes, the effects of an attack happen in attackComplete(), triggered 400ms after attack().
export function attackComplete(state: State): State {
  playerAction();

  try {
    if (state.attack?.from && state.attack?.to) {
      const [source, target]: w.HexId[] = [state.attack.from, state.attack.to];

      const attacker: w.Object = currentPlayer(state).objectsOnBoard[source];
      const defender: w.Object = opponentPlayer(state).objectsOnBoard[target];

      // Get attacker and defender's Attack stats now in case they change over the course of combat.
      // (Conceptually, the two objects damage each other simultaneously.)
      const attackerAttack: number = getAttribute(attacker, 'attack') || 0;
      const defenderAttack: number = getAttribute(defender, 'attack') || 0;

      state = triggerEvent(state, 'afterAttackedBy', {
        object: defender,
        condition: ((t) => !t.attackerType || stringToType(t.attackerType) === attacker.card.type || t.attackerType === 'allobjects'),
        undergoer: attacker
      });

      state = triggerEvent(state, 'afterAttack', {
        object: attacker,
        condition: ((t) => !t.defenderType || stringToType(t.defenderType) === defender.card.type || t.defenderType === 'allobjects'),
        undergoer: defender
      }, () => {
        defender.mostRecentlyInCombatWith = attacker.id;
        state = dealDamageToObjectAtHex(state, attackerAttack, target, attacker, 'combat');
        if (attackerAttack > 0) {
          state = triggerEvent(state, 'afterDealsDamage', {
            object: attacker,
            condition: ((t) => matchesType(defender, t.cardType || 'allobjects')),
            undergoer: defender
          });
        }
        return state;
      });


      if (!hasEffect(defender, 'cannotfightback') && defenderAttack > 0) {
        attacker.mostRecentlyInCombatWith = defender.id;
        state = dealDamageToObjectAtHex(state, defenderAttack, source, defender, 'combat');
        state = triggerEvent(state, 'afterDealsDamage', {
          object: defender,
          condition: ((t) => matchesType(attacker, t.cardType || 'allobjects')),
          undergoer: attacker
        });
      }

      // Move attacker to defender's space (if possible).
      if (getAttribute(defender, 'health')! <= 0 && getAttribute(attacker, 'health')! > 0) {
        state = transportObject(state, source, target);

        // (This is mostly to make sure that the attacker doesn't die as a result of this move.)
        state = applyAbilities(state);
        state = updateOrDeleteObjectAtHex(state, attacker, target);
      }

      state = applyAbilities(state);
      state = selectTile(state, null);
    }
  } finally {
    state.attack = null;
  }

  return state;
}

export function activateObject(state: State, abilityIdx: number, selectedHexId: w.HexId | null = null): State {
  playerAction();

  if (currentPlayer(state).target.choosing) {
    // If the player is in target-selection mode, just get out of that mode instead.
    resetTargetAndStatus(currentPlayer(state));
    return state;
  }

  // Work on a copy of the state in case we have to rollback
  // (if a target needs to be selected for an afterPlayed trigger).
  let tempState: State = cloneDeep(state);

  const hexId = selectedHexId || currentPlayer(tempState).selectedTile;
  if (!hexId) {
    return state;
  }

  const object = allObjectsOnBoard(tempState)[hexId];

  if (object && canActivate(object) && object.activatedAbilities![abilityIdx]) {
    const player: PlayerState = currentPlayer(tempState);
    const ability: w.ActivatedAbility = object.activatedAbilities![abilityIdx];

    const logMsg = `activated |${object.card.id}|'s "${ability.text}" ability`;
    const target: w.Targetable | null = player.target.chosen ? player.target.chosen[0] : null;

    tempState = triggerSound(tempState, 'event.wav');
    tempState = logAction(tempState, player, logMsg, { [object.card.id]: object.card }, null, target);
    tempState.memory = {};  // Clear any previously set memory in the state.

    try {
      executeCmd(tempState, ability.cmd, object);
    } catch (error) {
      // TODO better error handling: throw a custom Error object that we handle in the game reducer?
      console.error(error);
      if (state.player === state.currentTurn && (inBrowser() || inTest())) {
        // Show an alert only if it's the active player's turn (i.e. it's you and not your opponent who caused the error)
        alert(`Oops!\n\n${error}`);
      }
      throw error;
    }

    if (player.target.choosing) {
      // Target still needs to be selected, so roll back playing the card (and return old state).
      currentPlayer(state).target = player.target;
      currentPlayer(state).status = {
        message: `Choose ${player.target.numChoosing > 1 ? `${player.target.numChoosing} targets` : 'a target'} for ${object.card.name}'s ${ability.text} ability.`,
        type: 'text'
      };

      state.callbackAfterTargetSelected = ((newState: State) => activateObject(newState, abilityIdx, hexId));

      return state;
    } else if (tempState.invalid) {
      // Temp state is invalid (e.g. no valid target available or player unable to pay an energy cost).
      // So return the old state.
      return state;
    } else {
      // The activated ability has succeeded.
      object.cantActivate = true;
      object.cantAttack = true;

      // Save the callbackAfterExecution from the state (if any), in case it gets messed up (i.e. by applyAbilities()).
      // We will call it *after* ability handling.
      const { callbackAfterExecution } = tempState;

      tempState = applyAbilities(tempState);
      tempState = updateOrDeleteObjectAtHex(tempState, object, hexId);
      tempState = deselect(tempState);
      tempState = checkVictoryConditions(tempState);

      if (callbackAfterExecution) {
        tempState = callbackAfterExecution(tempState);
      }

      return tempState;
    }
  } else {
    return state;
  }
}

// TODO move the below methods to util/game.ts ?

// Low-level "move" of an object.
// Used by moveRobot(), attack(), and in tests.
export function transportObject(state: State, fromHex: w.HexId, toHex: w.HexId): State {
  const object = allObjectsOnBoard(state)[fromHex];
  const owner = ownerOf(state, object);

  if (object && owner && fromHex !== toHex) {
    owner.objectsOnBoard[toHex] = object;
    delete owner.objectsOnBoard[fromHex];
  }

  return state;
}

// Low-level swap of two object positions, used by the 'swapPositions' action.
export function swapObjectPositions(state: State, hex1: w.HexId, hex2: w.HexId): State {
  const object1 = allObjectsOnBoard(state)[hex1];
  const owner1 = ownerOf(state, object1);

  const object2 = allObjectsOnBoard(state)[hex2];
  const owner2 = ownerOf(state, object2);

  if (object1 && owner1 && object2 && owner2) {
    delete owner1.objectsOnBoard[hex1];
    delete owner2.objectsOnBoard[hex2];

    owner1.objectsOnBoard[hex2] = object1;
    owner2.objectsOnBoard[hex1] = object2;
  }

  return state;
}
