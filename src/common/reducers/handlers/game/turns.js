import { allObjectsOnBoard, currentPlayer, opponentName, executeCmd } from './util';

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
  // Activate endOfTurn triggers.
  Object.values(allObjectsOnBoard(state)).forEach(function (obj) {
    (obj.triggers || []).forEach(function (t) {
      if (t.trigger.type == 'endOfTurn' && t.trigger.players.map(p => p.name).includes(state.currentTurn)) {
        console.log(t.action);
        executeCmd(state, t.action, obj);
      }
    });
  });

  state.currentTurn = opponentName(state);
  state.selectedCard = null;
  state.selectedTile = null;
  state.playingRobot = false;
  state.status.message = '';
  state.target = {choosing: false, chosen: null, possibleHexes: []};

  return state;
}
