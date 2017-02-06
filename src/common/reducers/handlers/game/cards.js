import { TYPE_EVENT } from '../../../constants';

import { currentPlayer, executeCmd } from './util';

export function setSelectedCard(state, cardIdx) {
  const selectedCard = state.players[state.currentTurn].hand[cardIdx];
  const energy = state.players[state.currentTurn].energy;

  state.selectedTile = null;

  if (state.selectedCard == cardIdx) {
    // Clicked on already selected card => Deselect or play event

    if (selectedCard.type === TYPE_EVENT && selectedCard.cost <= energy.available) {
      return playEvent(state, cardIdx);
    } else {
      state.selectedCard = null;
      state.playingCardType = null;
      state.status.message = '';
    }
  } else {
    // Clicked on unselected card => Select

    state.selectedCard = cardIdx;
    state.target.choosing = false; // Reset targeting state.

    if (selectedCard.cost <= energy.available) {
      state.playingCardType = selectedCard.type;
      state.status.message = (selectedCard.type === TYPE_EVENT) ? 'Click this event again to play it.' : 'Select an available tile to play this card.';
      state.status.type = 'text';
    } else {
      state.playingCardType = null;
      state.status.message = 'You do not have enough energy to play this card.';
      state.status.type = 'error';
    }
  }

  return state;
}

export function placeCard(state, card, tile) {
  const player = currentPlayer(state);
  const selectedCardIndex = state.selectedCard;

  player.robotsOnBoard[tile] = {
    card: card,
    stats: card.stats,
    hasMoved: true
  };

  player.energy.available -= player.hand[selectedCardIndex].cost;
  player.hand.splice(selectedCardIndex, 1);

  state.selectedCard = null;
  state.playingCardType = null;
  state.status.message = '';

  return state;
}

export function playEvent(state, cardIdx, command) {
  const selectedCard = state.players[state.currentTurn].hand[cardIdx];

  if (_.isArray(selectedCard.command)) {
    selectedCard.command.forEach((cmd) => executeCmd(state, cmd));
  } else {
    executeCmd(state, selectedCard.command);
  }

  if (state.target.choosing) {
    state.status = { message: 'Choose a target for this event.', type: 'text' };
  } else {
    state.selectedCard = null;
    state.playingCardType = null;
    state.status.message = '';
    state.target = {choosing: false, chosen: null, possibleHexes: []};

    const player = state.players[state.currentTurn];
    player.energy.available -= selectedCard.cost;
    player.hand.splice(cardIdx, 1);
  }

  return state;
}
