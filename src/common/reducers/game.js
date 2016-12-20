import * as gameActions from '../actions/game';

var defaultState = {
  players: {
    red: {
      health: 20,
      hand: [],
      selectedCard: null
      deck: [],
      robotsOnBoard: {}
    },
    blue: {
      health: 20,
      hand: [],
      selectedCard: null
      deck: [],
      robotsOnBoard: {}
    }
  },
  currentTurn: 'red'
}

export default function game(state = defaultState, actiorn) {
  switch (action.type) {
    case gameActions.SET_SELECTED_CARD:
      var newState = Object.assign({}, state);
      newState.players.red.selectedCard = action.selectedCard;
      return newState;
    default:
      return state;
  }
}
