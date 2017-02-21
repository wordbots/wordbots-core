import { isArray, reduce } from 'lodash';

import defaultState from '../store/defaultState';
import * as gameActions from '../actions/game';

import g from './handlers/game';

export default function game(oldState = defaultState, action) {
  let state = Object.assign({}, oldState);

  if (isArray(action)) {
    // Allow multiple dispatch - this is primarily useful for simplifying testing.
    return reduce(action, game, state);
  } else {
    console.log(action);
    switch (action.type) {
      case gameActions.MOVE_ROBOT:
        return g.moveRobot(state, action.payload.from, action.payload.to, action.payload.asPartOfAttack);

      case gameActions.ATTACK:
        return g.attack(state, action.payload.source, action.payload.target);

      case gameActions.PLACE_CARD:
        return g.placeCard(state, action.payload.card, action.payload.tile);

      case gameActions.END_TURN:
        return g.endTurn(state);

      case gameActions.START_TURN:
        return g.startTurn(state);

      case gameActions.SET_SELECTED_CARD:
        return g.setSelectedCard(state, action.payload.selectedCard);

      case gameActions.SET_SELECTED_TILE:
        return g.setSelectedTile(state, action.payload.selectedTile);

      case gameActions.SET_HOVERED_CARD:
        return g.setHoveredCard(state, action.payload.hoveredCard);

      default:
        return state;
    }
  }
}
