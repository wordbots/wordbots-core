import { cloneDeep, isArray, reduce } from 'lodash';

import * as gameActions from '../actions/game';
import defaultState from '../store/defaultGameState';

import g from './handlers/game';

export default function game(oldState = cloneDeep(defaultState), action) {
  const state = Object.assign({}, oldState);

  if (isArray(action)) {
    // Allow multiple dispatch - this is primarily useful for simplifying testing.
    return reduce(action, game, state);
  } else {
    switch (action.type) {
      case gameActions.START_GAME:
        return g.newGame(state, action.payload.decks);

      case gameActions.NEW_GAME:
        state.started = false;
        return state;

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
        state.hoveredCardIdx = action.payload.hoveredCard;
        return state;

      case gameActions.SET_HOVERED_TILE:
        return g.setHoveredTile(state, action.payload.hoveredCard);

      default:
        return state;
    }
  }
}
