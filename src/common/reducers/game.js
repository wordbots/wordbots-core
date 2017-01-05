import * as gameActions from '../actions/game';
import { defaultState } from '../store/defaultState';

export default function game(state = defaultState, action) {
  let newState = Object.assign({}, state);

  switch (action.type) {
    case gameActions.MOVE_ROBOT:
      let movingRobot = state.players[state.currentTurn].robotsOnBoard[action.payload.from];
      newState.selectedTile = null;
      newState.players[state.currentTurn].robotsOnBoard[action.payload.from] = null;
      newState.players[state.currentTurn].robotsOnBoard[action.payload.to] = movingRobot;
      return newState;

    case gameActions.PASS_TURN:
      newState.currentTurn = (state.currentTurn == 'red' ? 'green' : 'red');
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
