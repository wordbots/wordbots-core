import * as gameActions from '../actions/game';
import { defaultState } from '../store/defaultState';

export default function game(state = defaultState, action) {
  let newState = Object.assign({}, state);

  switch (action.type) {
    case gameActions.PLACE_CARD:
      newState.players[state.currentTurn].robotsOnBoard[action.payload.tile] = {
        hasMoved: true,
        card: action.payload.card
      }
    case gameActions.PASS_TURN:
      newState.currentTurn = (state.currentTurn == 'red' ? 'green' : 'red');
      newState.players[newState.currentTurn].mana.total += 1;
      newState.players[newState.currentTurn].mana.used = 0;
      newState.players[newState.currentTurn].hand = 
        newState.players[newState.currentTurn].hand.concat(
          newState.players[newState.currentTurn].deck.splice(0, 1));
      return newState;
    case gameActions.SET_SELECTED_CARD:
      newState.players[state.currentTurn].selectedCard = action.payload.selectedCard;
      return newState;
    case gameActions.SET_SELECTED_TILE:
      newState.selectedTile = action.payload.selectedTile;
      return newState;
    default:
      return state;
  }
}
