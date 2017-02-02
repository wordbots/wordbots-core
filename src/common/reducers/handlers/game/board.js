import { currentPlayer, opponentPlayer, updateOrDeleteObjectAtHex } from './util';

export function setHoveredCard(state, card) {
  return _.assign(state, {hoveredCard: card});
}

export function setSelectedTile(state, tile) {
  state.players[state.currentTurn].selectedCard = null;
  state.placingRobot = false;
  state.status.message = '';

  if (state.selectedTile == tile) {
    state.selectedTile = null; // Deselect
  } else {
    state.selectedTile = tile; // Select
  }

  return state;
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

  // Apply damage.
  attacker.stats.health -= (defender.stats.attack || 0);
  defender.stats.health -= (attacker.stats.attack || 0);

  // Update or remove attacker and defender (this also calculates victory).
  updateOrDeleteObjectAtHex(state, attacker, source);
  updateOrDeleteObjectAtHex(state, defender, target);

  // Move attacker to defender's space (if possible).
  if (defender.stats.health <= 0 && attacker.stats.health > 0) {
    state.players[state.currentTurn].robotsOnBoard[target] = attacker;
    delete state.players[state.currentTurn].robotsOnBoard[source];
  }

  state.selectedTile = null;

  return state;
}
