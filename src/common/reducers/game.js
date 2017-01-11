import * as gameActions from '../actions/game';
import { defaultState } from '../store/defaultState';

export default function game(state = defaultState, action) {
  let newState = Object.assign({}, state);

  switch (action.type) {
    case gameActions.MOVE_ROBOT:
      let movingRobot = state.players[state.currentTurn].robotsOnBoard[action.payload.from];
      movingRobot.hasMoved = true;

      newState.selectedTile = null;
      delete newState.players[state.currentTurn].robotsOnBoard[action.payload.from];
      newState.players[state.currentTurn].robotsOnBoard[action.payload.to] = movingRobot;
      return newState;

    case gameActions.PLACE_CARD:
      newState.players[state.currentTurn].robotsOnBoard[action.payload.tile] = {
        hasMoved: true,
        card: action.payload.card
      }

    case gameActions.END_TURN:
      const turn = (state.currentTurn == 'blue' ? 'orange' : 'blue');

      const hand = newState.players[turn].hand;
      const robots = newState.players[turn].robotsOnBoard;

      newState.currentTurn = turn;
      newState.players[turn].mana.total += 1;
      newState.players[turn].mana.used = 0;
      newState.players[turn].hand = hand.concat(newState.players[turn].deck.splice(0, 1));

      Object.keys(robots).forEach((hex) => newState.players[turn].robotsOnBoard[hex].hasMoved = false);
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
