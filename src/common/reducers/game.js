import { cloneDeep, isArray, reduce } from 'lodash';

import * as gameActions from '../actions/game';
import * as socketActions from '../actions/socket';
import defaultState from '../store/defaultGameState';

import g from './handlers/game';

export default function game(oldState = cloneDeep(defaultState), action) {
  let state = Object.assign({}, oldState);

  if (isArray(action)) {
    // Allow multiple dispatch - this is primarily useful for simplifying testing.
    return reduce(action, game, state);
  } else {
    switch (action.type) {
      case gameActions.START_GAME:
      case socketActions.GAME_START:
        return g.newGame(state, action.payload.player || 'orange', action.payload.decks);

      case gameActions.NEW_GAME:
        return Object.assign(state, {started: false});

      case gameActions.MOVE_ROBOT:
        return g.moveRobot(state, action.payload.from, action.payload.to);

      case gameActions.ATTACK:
        return g.attack(state, action.payload.source, action.payload.target);

      case gameActions.MOVE_ROBOT_AND_ATTACK: {
        state = g.moveRobot(state, action.payload.from, action.payload.to, true);
        state = g.attack(state, action.payload.to, action.payload.target);
        return state;
      }

      case gameActions.PLACE_CARD:
        return g.placeCard(state, action.payload.card, action.payload.tile);

      case gameActions.PASS_TURN:
        return g.startTurn(g.endTurn(state));

      case gameActions.SET_SELECTED_CARD:
        return g.setSelectedCard(state, action.payload.player, action.payload.selectedCard);

      case gameActions.SET_SELECTED_TILE:
        return g.setSelectedTile(state, action.payload.player, action.payload.selectedTile);

      case gameActions.SET_HOVERED_CARD:
        return Object.assign(state, {hoveredCardIdx: action.payload.hoveredCard});

      case gameActions.SET_HOVERED_TILE:
        return g.setHoveredTile(state, action.payload.hoveredCard);

      default:
        return state;
    }
  }
}
