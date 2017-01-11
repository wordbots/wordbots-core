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
      newState.currentTurn = (state.currentTurn == 'blue' ? 'orange' : 'blue');
      return newState;

    case gameActions.START_TURN:
      const player = newState.players[newState.currentTurn];

      player.mana.total += 1;
      player.mana.used = 0;
      player.hand = player.hand.concat(player.deck.splice(0, 1));
      Object.keys(player.robotsOnBoard).forEach((hex) => player.robotsOnBoard[hex].hasMoved = false);

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
