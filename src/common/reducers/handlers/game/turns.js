import { currentPlayer, opponentName } from './util';

export function startTurn(state) {
  const player = currentPlayer(state);
  player.energy.total += 1;
  player.energy.available = player.energy.total;
  player.hand = player.hand.concat(player.deck.splice(0, 1));
  player.robotsOnBoard = _.mapValues(player.robotsOnBoard, (robot) => _.assign(robot, {hasMoved: false}));
  Object.keys(player.robotsOnBoard).forEach((hex) =>
    player.robotsOnBoard[hex].hasMoved = false
  );

  return state;
}

export function endTurn(state) {
  state.currentTurn = opponentName(state);
  state.selectedCard = null;
  state.selectedTile = null;
  state.playingRobot = false;
  state.status.message = '';
  state.target = {choosing: false, chosen: null, possibleHexes: []};

  return state;
}
