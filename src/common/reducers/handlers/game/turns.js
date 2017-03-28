import { currentPlayer, opponentName, drawCards, triggerEvent, newGame } from '../../../util/game';

export function startNewGame(state, player, decks) {
  return newGame(state, player, {blue: decks.blue, orange: decks.orange});
}

export function startTurn(state) {
  const player = currentPlayer(state);
  player.energy.total = Math.min(player.energy.total + 1, 10);
  player.energy.available = player.energy.total;
  player.robotsOnBoard = _.mapValues(player.robotsOnBoard, (robot =>
    Object.assign({}, robot, {movesLeft: robot.stats.speed})
  ));

  state = drawCards(state, player, 1);
  state = triggerEvent(state, 'beginningOfTurn', {player: true});

  return state;
}

export function endTurn(state) {
  const player = currentPlayer(state);
  player.selectedCard = null;
  player.selectedTile = null;

  state = triggerEvent(state, 'endOfTurn', {player: true});

  state.currentTurn = opponentName(state);
  state.hoveredCardIdx = null;
  state.playingCardType = null;
  state.status.message = '';
  state.target = {choosing: false, chosen: null, possibleHexes: [], possibleCards: []};


  return state;
}
