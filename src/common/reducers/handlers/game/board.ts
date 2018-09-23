import { cloneDeep } from 'lodash';

import * as w from '../../../types';
import { stringToType } from '../../../constants';
import {
  currentPlayer, opponentPlayer, allObjectsOnBoard, getAttribute, ownerOf, hasEffect,
  validMovementHexes, validAttackHexes,
  triggerSound, logAction, dealDamageToObjectAtHex, updateOrDeleteObjectAtHex, setTargetAndExecuteQueuedAction,
  executeCmd, triggerEvent, applyAbilities
} from '../../../util/game';
import HexUtils from '../../../components/hexgrid/HexUtils';

type State = w.GameState;
type PlayerState = w.PlayerInGameState;

function selectTile(state: State, tile: w.HexId | null): State {
  currentPlayer(state).selectedTile = tile;
  currentPlayer(state).selectedCard = null;
  return state;
}

function resetTargetAndStatus(player: PlayerState): void {
  player.status = { message: '', type: '' };
  player.target = { choosing: false, chosen: null, possibleCards: [], possibleHexes: [] };
}

export function deselect(state: State, playerColor: w.PlayerColor = state.currentTurn): State {
  const player = state.players[playerColor];
  player.selectedTile = null;
  player.selectedCard = null;
  resetTargetAndStatus(player);
  return state;
}

export function setSelectedTile(state: State, playerColor: w.PlayerColor, tile: w.HexId): State {
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
  const player: PlayerState = state.players[state.currentTurn];
  const movingRobot: w.Object = player.robotsOnBoard[fromHex];

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
    state = logAction(state, player, `moved |${movingRobot.card.name}|`, {[movingRobot.card.name]: movingRobot.card});
    state = transportObject(state, fromHex, toHex);
    state = triggerEvent(state, 'afterMove', {object: movingRobot});
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

    state = logAction(state, null, `|${movingRobot.card.name}| was moved`, {[movingRobot.card.name]: movingRobot.card});
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

  const attacker: w.Object = player.robotsOnBoard[source];
  const defender: w.Object = opponent.robotsOnBoard[target];

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
      state = logAction(state, player, `attacked |${defender.card.name}| with |${attacker.card.name}|`, {
        [defender.card.name]: defender.card,
        [attacker.card.name]: attacker.card
      });
      state.attack = {from: source, to: target};
      state = deselect(state);
    }
  }

  return state;
}

// For animation purposes, the effects of an attack happen in attackComplete(), triggered 400ms after attack().
export function attackComplete(state: State): State {
  if (state.attack && state.attack.from && state.attack.to) {
    const [source, target] = [state.attack.from, state.attack.to];

    const attacker: w.Object = currentPlayer(state).robotsOnBoard[source];
    const defender: w.Object = opponentPlayer(state).robotsOnBoard[target];

    state = triggerEvent(state, 'afterAttack', {
      object: attacker,
      condition: ((t) => !t.defenderType || stringToType(t.defenderType) === defender.card.type || t.defenderType === 'allobjects'),
      undergoer: defender
    }, () =>
      dealDamageToObjectAtHex(state, getAttribute(attacker, 'attack') || 0, target, 'combat')
    );

    if (!hasEffect(defender, 'cannotfightback') && getAttribute(defender, 'attack')! > 0) {
      state = dealDamageToObjectAtHex(state, getAttribute(defender, 'attack') || 0, source, 'combat');
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

  state.attack = null;

  return state;
}

export function activateObject(state: State, abilityIdx: number, selectedHexId: w.HexId | null = null): State {
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

  if (object && !object.cantActivate && object.activatedAbilities && object.activatedAbilities[abilityIdx]) {
    const player: PlayerState = currentPlayer(tempState);
    const ability: w.ActivatedAbility = object.activatedAbilities[abilityIdx];

    const logMsg = `activated |${object.card.name}|'s "${ability.text}" ability`;
    const target: w.Targetable | null = player.target.chosen ? player.target.chosen[0] : null;

    tempState = triggerSound(tempState, 'event.wav');
    tempState = logAction(tempState, player, logMsg, {[object.card.name]: object.card}, null, target);

    executeCmd(tempState, ability.cmd, object);

    if (player.target.choosing) {
      // Target still needs to be selected, so roll back playing the card (and return old state).
      currentPlayer(state).target = player.target;
      currentPlayer(state).status = {
        message: `Choose a target for ${object.card.name}'s ${ability.text} ability.`,
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

      tempState = applyAbilities(tempState);
      tempState = updateOrDeleteObjectAtHex(tempState, object, hexId);
      tempState = deselect(tempState);

      return tempState;
    }
  } else {
    return state;
  }
}

// Low-level "move" of an object.
// Used by moveRobot(), attack(), and in tests.
export function transportObject(state: State, fromHex: w.HexId, toHex: w.HexId): State {
  const object = allObjectsOnBoard(state)[fromHex];
  const owner = ownerOf(state, object);

  if (object && owner) {
    owner.robotsOnBoard[toHex] = object;
    delete owner.robotsOnBoard[fromHex];
  }

  return state;
}
