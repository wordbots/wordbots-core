import {
  activePlayer, currentPlayer, opponentPlayer, allObjectsOnBoard, getAttribute, movesLeft, allowedToAttack, ownerOf,
  validMovementHexes, validAttackHexes,
  dealDamageToObjectAtHex, updateOrDeleteObjectAtHex,
  triggerEvent, applyAbilities
} from '../../../util/game';
import HexUtils from '../../../components/react-hexgrid/HexUtils';

import { setTargetAndExecuteQueuedAction } from './cards';

export function setHoveredTile(state, card) {
  return Object.assign({}, state, {hoveredCard: card});
}

export function setSelectedTile(state, playerName, tile) {
  const player = state.players[playerName];

  if (state.target.choosing &&
      state.target.possibleHexes.includes(tile) &&
      player.selectedCard !== null) {
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
      activePlayer(state).selectedTile = null;
    }

    const distance = HexUtils.IDToHex(toHex).distance(HexUtils.IDToHex(fromHex));
    movingRobot.movesMade += distance;

    state = transportObject(state, fromHex, toHex);
    state = applyAbilities(state);
    state = updateOrDeleteObjectAtHex(state, movingRobot, toHex);
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

      state = triggerEvent(state, 'afterAttack', {object: attacker}, () =>
        dealDamageToObjectAtHex(state, getAttribute(attacker, 'attack') || 0, target, 'combat')
      );

      state = dealDamageToObjectAtHex(state, getAttribute(defender, 'attack') || 0, source, 'combat');

      // Move attacker to defender's space (if possible).
      if (getAttribute(defender, 'health') <= 0 && getAttribute(attacker, 'health') > 0) {
        state = transportObject(state, source, target);

        // (This is mostly to make sure that the attacker doesn't die as a result of this move.)
        state = applyAbilities(state);
        state = updateOrDeleteObjectAtHex(state, attacker, target);
      }

      state = applyAbilities(state);

      activePlayer(state).selectedTile = null;
    }
  }

  return state;
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
