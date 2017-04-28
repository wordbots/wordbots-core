import { cloneDeep } from 'lodash';

import { stringToType } from '../../../constants';
import {
  currentPlayer, opponentPlayer, allObjectsOnBoard, getAttribute, movesLeft, allowedToAttack, ownerOf, hasEffect,
  validMovementHexes, validAttackHexes,
  logAction, dealDamageToObjectAtHex, updateOrDeleteObjectAtHex, setTargetAndExecuteQueuedAction,
  executeCmd, triggerEvent, applyAbilities
} from '../../../util/game';
import HexUtils from '../../../components/react-hexgrid/HexUtils';

export function setHoveredTile(state, card) {
  return Object.assign({}, state, {hoveredCard: card});
}

export function setSelectedTile(state, playerName, tile) {
  const player = state.players[playerName];
  const isCurrentPlayer = (playerName === state.currentTurn);

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
    player.status.message = '';
    return state;
  }
}

export function moveRobot(state, fromHex, toHex, asPartOfAttack = false) {
  const player = state.players[state.currentTurn];
  const movingRobot = player.robotsOnBoard[fromHex];

  // Is the move valid?
  const validHexes = validMovementHexes(state, HexUtils.IDToHex(fromHex), movesLeft(movingRobot), movingRobot);
  if (validHexes.map(HexUtils.getID).includes(toHex)) {
    if (!asPartOfAttack) {
      currentPlayer(state).selectedTile = null;
    }

    const distance = HexUtils.IDToHex(toHex).distance(HexUtils.IDToHex(fromHex));
    movingRobot.movesMade += distance;
    movingRobot.movedThisTurn = true;

    state = transportObject(state, fromHex, toHex);
    state = triggerEvent(state, 'afterMove', {object: movingRobot});
    state = applyAbilities(state);
    state = updateOrDeleteObjectAtHex(state, movingRobot, toHex);
    state = logAction(state, player, `moved |${movingRobot.card.name}|`, {[movingRobot.card.name]: movingRobot.card});
  }

  return state;
}

export function attack(state, source, target) {
  // TODO: All attacks are "melee" for now.
  // In the future, there will be ranged attacks that work differently.

  const player = currentPlayer(state);
  const opponent = opponentPlayer(state);

  const attacker = player.robotsOnBoard[source];
  const defender = opponent.robotsOnBoard[target];

  if (attacker) {
    // Is the attack valid?
    const validHexes = validAttackHexes(state, player.name, HexUtils.IDToHex(source), movesLeft(attacker), attacker);
    if (validHexes.map(HexUtils.getID).includes(target) && allowedToAttack(state, attacker, target)) {
      attacker.cantMove = true;
      attacker.cantActivate = true;
      attacker.attackedThisTurn = true;

      state = triggerEvent(state, 'afterAttack', {
        object: attacker,
        condition: (t => !t.defenderType ||  stringToType(t.defenderType) === defender.card.type || t.defenderType === 'allobjects')
      }, () =>
        dealDamageToObjectAtHex(state, getAttribute(attacker, 'attack') || 0, target, 'combat')
      );

      if (!hasEffect(defender, 'cannotfightback')) {
        state = dealDamageToObjectAtHex(state, getAttribute(defender, 'attack') || 0, source, 'combat');
      }

      // Move attacker to defender's space (if possible).
      if (getAttribute(defender, 'health') <= 0 && getAttribute(attacker, 'health') > 0) {
        state = transportObject(state, source, target);

        // (This is mostly to make sure that the attacker doesn't die as a result of this move.)
        state = applyAbilities(state);
        state = updateOrDeleteObjectAtHex(state, attacker, target);
      }

      state = applyAbilities(state);
      state = logAction(state, player, `attacked |${defender.card.name}| with |${attacker.card.name}|`, {
        [defender.card.name]: defender.card,
        [attacker.card.name]: attacker.card
      });

      currentPlayer(state).selectedTile = null;
    }
  }

  return state;
}

export function activateObject(state, abilityIdx, selectedHexId = null) {
  // Work on a copy of the state in case we have to rollback
  // (if a target needs to be selected for an afterPlayed trigger).
  let tempState = cloneDeep(state);

  const hexId = selectedHexId || currentPlayer(tempState).selectedTile;
  const object = allObjectsOnBoard(tempState)[hexId];

  if (object && !object.cantActivate && object.activatedAbilities && object.activatedAbilities[abilityIdx]) {
    const player = currentPlayer(tempState);
    const ability = object.activatedAbilities[abilityIdx];

    tempState = logAction(tempState, player, `activated |${object.card.name}|'s "${ability.text}" ability`, {
      [object.card.name]: object.card
    });

    executeCmd(tempState, ability.cmd, object);

    if (player.target.choosing) {
      // Target still needs to be selected, so roll back playing the card (and return old state).
      currentPlayer(state).target = player.target;
      currentPlayer(state).status = {
        message: `Choose a target for ${object.card.name}'s ${ability.text} ability.`,
        type: 'text'
      };

      state.callbackAfterTargetSelected = (newState => activateObject(newState, abilityIdx, hexId));

      return state;
    } else {
      object.cantActivate = true;
      object.cantAttack = true;

      return tempState;
    }
  } else {
    return state;
  }
}

// Low-level "move" of an object.
// Used by moveRobot(), attack(), and in tests.
export function transportObject(state, fromHex, toHex) {
  const robot = allObjectsOnBoard(state)[fromHex];
  const owner = ownerOf(state, robot);

  owner.robotsOnBoard[toHex] = robot;
  delete owner.robotsOnBoard[fromHex];

  return state;
}
