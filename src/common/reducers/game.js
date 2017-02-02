import { defaultState } from '../store/defaultState';
import * as gameActions from '../actions/game';
import { gameHandlers } from './handlers/game';

export default function game(oldState = defaultState, action) {
  let state = Object.assign({}, oldState);

  switch (action.type) {
    case gameActions.MOVE_ROBOT:
      return gameHandlers.moveRobot(state, action.payload.from, action.payload.to, action.payload.asPartOfAttack);

    case gameActions.ATTACK:
      return gameHandlers.attack(state, action.payload.source, action.payload.target);

    case gameActions.PLACE_CARD:
      return gameHandlers.placeCard(state, action.payload.card, action.payload.tile);

    case gameActions.END_TURN:
      return gameHandlers.endTurn(state);

    case gameActions.START_TURN:
      return gameHandlers.startTurn(state);

    case gameActions.SET_SELECTED_CARD:
      return gameHandlers.setSelectedCard(state, action.payload.selectedCard);

    case gameActions.SET_SELECTED_TILE:
      return gameHandlers.setSelectedTile(state, action.payload.selectedTile);

    case gameActions.SET_HOVERED_CARD:
      return gameHandlers.setHoveredCard(state, action.payload.hoveredCard);

    default:
      return state;
  }
}
