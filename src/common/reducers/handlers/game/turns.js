import { currentPlayer, opponentName, checkTriggers } from '../../../util';

export function startTurn(state) {
  const player = currentPlayer(state);
  player.energy.total += 1;
  player.energy.available = player.energy.total;
  player.hand = player.hand.concat(player.deck.splice(0, 1));
  player.robotsOnBoard = _.mapValues(player.robotsOnBoard, (robot) =>
    _.assign(robot, {movesLeft: robot.stats.speed})
  );

  state = checkTriggers(state, 'beginningOfTurn', (trigger =>
    trigger.players.map(p => p.name).includes(state.currentTurn)
  ));

  return state;
}

export function endTurn(state) {
  state = checkTriggers(state, 'endOfTurn', (trigger =>
    trigger.players.map(p => p.name).includes(state.currentTurn)
  ));

  state.currentTurn = opponentName(state);
  state.selectedCard = null;
  state.selectedTile = null;
  state.playingRobot = false;
  state.status.message = '';
  state.target = {choosing: false, chosen: null, possibleHexes: []};

  return state;
}
