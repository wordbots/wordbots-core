import { cloneDeep, isArray, reduce } from 'lodash';

import { id } from '../util/common';
import * as gameActions from '../actions/game';
import * as socketActions from '../actions/socket';
import defaultState from '../store/defaultGameState';

import g from './handlers/game';

export default function game(oldState = cloneDeep(defaultState), action) {
  let state = Object.assign({}, oldState, {actionId: id()});  // Note: actionId is to correctly merge actions in the action log.

  if (isArray(action)) {
    // Allow multiple dispatch - this is primarily useful for simplifying testing.
    return reduce(action, game, state);
  } else {
    switch (action.type) {
      case gameActions.START_GAME:
      case socketActions.GAME_START:
        return g.newGame(state, action.payload.player || 'orange', action.payload.usernames || {}, action.payload.decks);

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

      case gameActions.ACTIVATE_OBJECT:
        return g.activateObject(state, action.payload.abilityIdx);

      case gameActions.PLACE_CARD:
        return g.placeCard(state, action.payload.cardIdx, action.payload.tile);

      case gameActions.PASS_TURN:
        return g.passTurn(state, action.payload.player);

      case gameActions.SET_SELECTED_CARD:
        return g.setSelectedCard(state, action.payload.player, action.payload.selectedCard);

      case gameActions.SET_SELECTED_TILE:
        return g.setSelectedTile(state, action.payload.player, action.payload.selectedTile);

      case gameActions.SET_HOVERED_CARD:
        return Object.assign(state, {hoveredCardIdx: action.payload.hoveredCard});

      case gameActions.SET_HOVERED_TILE:
        return g.setHoveredTile(state, action.payload.hoveredCard);

      case socketActions.CONNECTING:
        return Object.assign(state, {started: false});

      case socketActions.CURRENT_STATE:
        // This is used for spectating an in-progress game - the server sends back a log of all actions so far.
        return reduce(action.payload.actions, game, state);

      case socketActions.FORFEIT:
        return Object.assign(state, {winner: action.payload.winner});

      default:
        return state;
    }
  }
}
