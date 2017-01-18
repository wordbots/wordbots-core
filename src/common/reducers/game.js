import * as gameActions from '../actions/game';
import { defaultState } from '../store/defaultState';

export default function game(state = defaultState, action) {
  let newState = Object.assign({}, state);
  let player = newState.players[state.currentTurn];

  switch (action.type) {
    case gameActions.MOVE_ROBOT:
      let movingRobot = state.players[state.currentTurn].robotsOnBoard[action.payload.from];
      movingRobot.hasMoved = true;

      newState.selectedTile = null;
      delete newState.players[state.currentTurn].robotsOnBoard[action.payload.from];
      newState.players[state.currentTurn].robotsOnBoard[action.payload.to] = movingRobot;

      return newState;

    case gameActions.PLACE_CARD:
      let selectedCardIndex = newState.players[state.currentTurn].selectedCard;

      player.robotsOnBoard[action.payload.tile] = {
        hasMoved: true,
        card: action.payload.card
      }

      player.selectedCard = null;
      player.mana.used += player.hand[selectedCardIndex].cost;
      player.hand.splice(selectedCardIndex, 1);

      newState.placingRobot = false;
      newState.status.message = '';

      return newState;

    case gameActions.END_TURN:
      newState.currentTurn = (state.currentTurn == 'blue' ? 'orange' : 'blue');

      return newState;

    case gameActions.START_TURN:
      player.mana.total += 1;
      player.mana.used = 0;
      player.hand = player.hand.concat(player.deck.splice(0, 1));
      Object.keys(player.robotsOnBoard).forEach((hex) => player.robotsOnBoard[hex].hasMoved = false);

      return newState;

    case gameActions.SET_SELECTED_CARD:
      let selectedCard = newState.players[state.currentTurn].hand[action.payload.selectedCard];
      let mana = newState.players[state.currentTurn].mana;

      newState.selectedTile = null;
      newState.players[state.currentTurn].selectedCard = action.payload.selectedCard;

      if (selectedCard.cost <= mana.total - mana.used) {
        if (selectedCard.type === 0) {
          newState.placingRobot = true;
          newState.status.message = 'Select an available tile to place this robot.';
          newState.status.type = 'text';
        } else {
          // Playing spell logic
          newState.placingRobot = false;
          newState.status.message = '';
        }
      } else {
        newState.placingRobot = false;
        newState.status.message = 'You do not have enough mana to play this card.';
        newState.status.type = 'error';
      }

      return newState;

    case gameActions.SET_SELECTED_TILE:
      newState.players[state.currentTurn].selectedCard = null;
      newState.selectedTile = action.payload.selectedTile;
      newState.placingRobot = false;
      newState.status = '';
      
      return newState;

    default:
      return state;
  }
}
