import * as gameActions from '../actions/game';

export default function game(state = {
  selectedCard: null
}, action) {
  switch (action.type) {
    case gameActions.SET_SELECTED_CARD:
      return {...state, selectedCard: action.selectedCard};
    default:
      return state;
  }
}
