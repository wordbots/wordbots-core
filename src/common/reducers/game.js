import * as gameActions from '../actions/game';
import { defaultState } from '../store/defaultState';

export default function game(state = defaultState, action) {
  let newState = Object.assign({}, state);

  switch (action.type) {
    case gameActions.PASS_TURN:
      newState.currentTurn = (state.currentTurn == 'red' ? 'green' : 'red');
      newState.players[newState.currentTurn].mana.total += 1;
      newState.players[newState.currentTurn].mana.used = 0;
      return newState;
    case gameActions.SET_SELECTED_CARD:
      newState.players.green.selectedCard = action.payload.selectedCard;
      return newState;
    case gameActions.SET_SELECTED_TILE:
      newState.selectedTile = action.payload.selectedTile;
      return newState;
    default:
      return state;
  }
}
