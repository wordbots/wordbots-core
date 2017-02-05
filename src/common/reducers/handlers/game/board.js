import { currentPlayer, opponentPlayer, allObjectsOnBoard, dealDamageToObjectAtHex } from './util';
import { playEvent } from './cards';

export function setHoveredCard(state, card) {
  return _.assign(state, {hoveredCard: card});
}

export function setSelectedTile(state, tile) {
  if (state.target.choosing && state.target.possibleHexes.includes(tile) && state.players[state.currentTurn].selectedCard) {
    // Select target tile for event.
    // TODO handle: (1) multiple targets per effect,
    //              (2) targets that are cards in hand (rather than objects in board),
    //              (3) targets that aren't for events.
    state.target = {
      chosen: [[tile, allObjectsOnBoard(state)[tile]]],
      choosing: false,
      possibleHexes: []
    };

    return playEvent(state, state.players[state.currentTurn].selectedCard);
  } else {
    // Toggle tile selection.
    state.selectedTile = (state.selectedTile == tile) ? null : tile;
    state.players[state.currentTurn].selectedCard = null;
    state.playingCardType = null;
    state.status.message = '';
    return state;
  }
}

export function moveRobot(state, fromHex, toHex, asPartOfAttack = false) {
  const player = state.players[state.currentTurn];
  const movingRobot = player.robotsOnBoard[fromHex];

  if (!asPartOfAttack) {
    movingRobot.hasMoved = true;
    state.selectedTile = null;
  }

  delete state.players[state.currentTurn].robotsOnBoard[fromHex];
  state.players[state.currentTurn].robotsOnBoard[toHex] = movingRobot;

  return state;
}

export function attack(state, source, target) {
  // TODO: All attacks are "melee" for now.
  // In the future, there will be ranged attacks that work differently.

  const player = currentPlayer(state);
  const opponent = opponentPlayer(state);

  const attacker = player.robotsOnBoard[source];
  const defender = opponent.robotsOnBoard[target];

  attacker.hasMoved = true;

  dealDamageToObjectAtHex(state, defender.stats.attack || 0, source);
  dealDamageToObjectAtHex(state, attacker.stats.attack || 0, target);

  // Move attacker to defender's space (if possible).
  if (defender.stats.health <= 0 && attacker.stats.health > 0) {
    state.players[state.currentTurn].robotsOnBoard[target] = attacker;
    delete state.players[state.currentTurn].robotsOnBoard[source];
  }

  state.selectedTile = null;

  return state;
}
