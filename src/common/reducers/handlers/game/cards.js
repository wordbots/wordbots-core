import { TYPE_ROBOT } from '../../../constants'
import { currentPlayer, executeCmd } from './util'

export function setSelectedCard(state, cardIdx) {
  const selectedCard = state.players[state.currentTurn].hand[cardIdx];
  const energy = state.players[state.currentTurn].energy;

  state.selectedTile = null;

  if (state.players[state.currentTurn].selectedCard == cardIdx) {
    // Deselect or play event
    if (selectedCard.type === TYPE_ROBOT) {
      state.players[state.currentTurn].selectedCard = null;
      state.placingRobot = false;
      state.status.message = '';
    } else {
      return playEvent(state, cardIdx);
    }
  } else {
    // Select
    state.players[state.currentTurn].selectedCard = cardIdx;

    if (selectedCard.cost <= energy.total - energy.used) {
      if (selectedCard.type === TYPE_ROBOT) {
        state.placingRobot = true;
        state.playingCard = false;
        state.status.message = 'Select an available tile to place this robot.';
        state.status.type = 'text';
      } else {
        state.placingRobot = false;
        state.playingCard = true;
        state.status.message = 'Click this event again to play it.';
        state.status.type = 'text';
      }
    } else {
      state.placingRobot = false;
      state.status.message = 'You do not have enough energy to play this card.';
      state.status.type = 'error';
    }
  }

  return state;
}

export function placeCard(state, card, tile) {
  const player = currentPlayer(state);
  const selectedCardIndex = state.players[state.currentTurn].selectedCard;

  player.robotsOnBoard[tile] = {
    card: card,
    stats: card.stats,
    hasMoved: true
  }

  player.selectedCard = null;
  player.energy.used += player.hand[selectedCardIndex].cost;
  player.hand.splice(selectedCardIndex, 1);

  state.placingRobot = false;
  state.status.message = '';

  return state;
}

function playEvent(state, cardIdx, command) {
  const selectedCard = state.players[state.currentTurn].hand[cardIdx];

  executeCmd(state, selectedCard.command);

  const player = state.players[state.currentTurn];
  player.selectedCard = null;
  player.energy.used += selectedCard.cost;
  player.hand.splice(cardIdx, 1);

  state.playingCard = false;
  state.status.message = '';

  return state;
}
