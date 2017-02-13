import {
  currentPlayer, opponentPlayer, allObjectsOnBoard, getAttribute,
  dealDamageToObjectAtHex, updateOrDeleteObjectAtHex, checkTriggers, applyAbilities
} from '../../../util';
import HexUtils from '../../../components/react-hexgrid/HexUtils';

import { playEvent } from './cards';

export function setHoveredCard(state, card) {
  return _.assign(state, {hoveredCard: card});
}

export function setSelectedTile(state, tile) {
  if (state.target.choosing && state.target.possibleHexes.includes(tile) && !_.isNull(state.selectedCard)) {
    // Select target tile for event.
    // TODO handle: (1) targets that are cards in hand (rather than objects in board),
    //              (2) targets that are for afterPlayed triggers on objects, rather than events.
    state.target = {
      chosen: [allObjectsOnBoard(state)[tile]],
      choosing: false,
      possibleHexes: []
    };

    return playEvent(state, state.selectedCard);
  } else {
    // Toggle tile selection.
    state.selectedTile = (state.selectedTile == tile) ? null : tile;
    state.selectedCard = null;
    state.playingCardType = null;
    state.status.message = '';
    return state;
  }
}

export function moveRobot(state, fromHex, toHex, asPartOfAttack = false) {
  const player = state.players[state.currentTurn];
  const movingRobot = player.robotsOnBoard[fromHex];

  if (!asPartOfAttack) {
    movingRobot.movesLeft -= HexUtils.IDToHex(toHex).distance(HexUtils.IDToHex(fromHex));
    state.selectedTile = null;
  }

  delete state.players[state.currentTurn].robotsOnBoard[fromHex];
  state.players[state.currentTurn].robotsOnBoard[toHex] = movingRobot;

  state = applyAbilities(state);

  updateOrDeleteObjectAtHex(state, movingRobot, toHex);

  return state;
}

export function attack(state, source, target) {
  // TODO: All attacks are "melee" for now.
  // In the future, there will be ranged attacks that work differently.

  const player = currentPlayer(state);
  const opponent = opponentPlayer(state);

  const attacker = player.robotsOnBoard[source];
  const defender = opponent.robotsOnBoard[target];

  attacker.movesLeft = 0;

  dealDamageToObjectAtHex(state, getAttribute(defender, 'attack') || 0, source);
  dealDamageToObjectAtHex(state, getAttribute(attacker, 'attack') || 0, target);

  state = checkTriggers(state, 'afterAttack', (trigger =>
    trigger.objects.map(o => o.id).includes(attacker.id)
  ));

  state = checkTriggers(state, 'afterAttack', (trigger =>
    trigger.objects.map(o => o.id).includes(attacker.id)
  ));

  // Move attacker to defender's space (if possible).
  if (getAttribute(defender, 'health') <= 0 && getAttribute(attacker, 'health') > 0) {
    state.players[state.currentTurn].robotsOnBoard[target] = attacker;
    delete state.players[state.currentTurn].robotsOnBoard[source];
  }

  state.selectedTile = null;

  return state;
}
