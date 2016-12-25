import * as gameActions from '../actions/game';

let defaultState = {
  players: {
    red: {
      health: 20,
      hand: [],
      selectedCard: null,
      deck: [],
      robotsOnBoard: {}
    },
    blue: {
      health: 20,
      hand: [],
      selectedCard: null,
      deck: [],
      robotsOnBoard: {}
    }
  },
  currentTurn: 'red'
}

export default function game(state = defaultState, action) {
  switch (action.type) {
    case gameActions.SET_SELECTED_CARD:
      let newState = Object.assign({}, state);
      newState.players.red.selectedCard = action.payload.selectedCard;
      return newState;
    default:
      return state;
  }
}
