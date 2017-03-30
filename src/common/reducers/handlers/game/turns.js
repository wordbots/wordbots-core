import { currentPlayer, opponentName, drawCards, triggerEvent, newGame } from '../../../util/game';

export function startNewGame(state, decks) {
  return newGame(state, {blue: decks.blue, orange: decks.orange});
}

export function startTurn(state) {
  const player = currentPlayer(state);
  player.energy.total = Math.min(player.energy.total + 1, 10);
  player.energy.available = player.energy.total;
  player.robotsOnBoard = _.mapValues(player.robotsOnBoard, (robot =>
    Object.assign({}, robot, {cantMove: false, movesMade: 0})
  ));

  state = drawCards(state, player, 1);

  state = triggerEvent(state, 'beginningOfTurn', {player: true});

  return state;
}

export function endTurn(state) {
  state = triggerEvent(state, 'endOfTurn', {player: true});

  state.currentTurn = opponentName(state);
  state.selectedCard = null;
  state.selectedTile = null;
  state.hoveredCardIdx = null;
  state.playingCardType = null;
  state.status.message = '';
  state.target = {choosing: false, chosen: null, possibleHexes: [], possibleCards: []};

  return state;
}
