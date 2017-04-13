import { mapValues } from 'lodash';

import { currentPlayer, opponentName, drawCards, triggerEvent, newGame } from '../../../util/game';

export function startNewGame(state, player, usernames, decks) {
  return newGame(state, player, usernames, decks);
}

export function startTurn(state) {
  const player = currentPlayer(state);
  player.energy.total = Math.min(player.energy.total + 1, 10);
  player.energy.available = player.energy.total;
  player.robotsOnBoard = mapValues(player.robotsOnBoard, (robot =>
    Object.assign({}, robot, {cantMove: false, movesMade: 0})
  ));

  state = drawCards(state, player, 1);
  state = triggerEvent(state, 'beginningOfTurn', {player: true});

  return state;
}

export function endTurn(state) {
  const player = currentPlayer(state);
  player.selectedCard = null;
  player.selectedTile = null;
  player.status.message = '';
  player.target = {choosing: false, chosen: null, possibleHexes: [], possibleCards: []};

  state = triggerEvent(state, 'endOfTurn', {player: true});
  state.currentTurn = opponentName(state);
  state.hoveredCardIdx = null;

  return state;
}
