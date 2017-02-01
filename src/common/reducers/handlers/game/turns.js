import { currentPlayer, opponentName } from './util'

export function startTurn(state) {
  const player = currentPlayer(state);
  player.energy.total += 1;
  player.energy.used = 0;
  player.hand = player.hand.concat(player.deck.splice(0, 1));
  player.robotsOnBoard = _.mapValues(player.robotsOnBoard, (robot) => _.assign(robot, {hasMoved: false}));
  Object.keys(player.robotsOnBoard).forEach((hex) =>
    player.robotsOnBoard[hex].hasMoved = false
  );

  return state;
}

export function endTurn(state) {
  const player = currentPlayer(state);
  player.selectedCard = null;

  state.currentTurn = opponentName(state);
  state.selectedTile = null;
  state.placingRobot = false;
  state.status.message = '';

  return state;
}
