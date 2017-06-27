import { cloneDeep, isArray, reduce } from 'lodash';

import { id } from '../util/common';
import { triggerSound } from '../util/game';
import * as gameActions from '../actions/game';
import * as socketActions from '../actions/socket';
import defaultState from '../store/defaultGameState';

import g from './handlers/game';

export default function game(state = cloneDeep(defaultState), action, allowed = false) {
  if (isArray(action)) {
    // Allow multiple dispatch - this is primarily useful for simplifying testing.
    return reduce(action, game, state);
  } else if (state.tutorial && !allowed) {
    // In tutorial mode, only one specific action is allowed at any given time.
    return g.handleTutorialAction(state, action);
  } else {
    return handleAction(state, action);
  }
}

export function handleAction(oldState, action) {
  let state = Object.assign({}, oldState, {
    actionId: id(),  // actionId is used to correctly merge actions in the action log.
    sfxQueue: []  // Clear the sound effects queue on every reducer step.
  });

  switch (action.type) {
    case socketActions.GAME_START:
      return g.newGame(state, action.payload.player || 'orange', action.payload.usernames || {}, action.payload.decks, action.payload.seed);

    case gameActions.START_TUTORIAL:
      return g.startTutorial(state);

    case gameActions.END_GAME:
      return Object.assign(state, {started: false});

    case gameActions.MOVE_ROBOT:
      return g.moveRobot(state, action.payload.from, action.payload.to);

    case gameActions.ATTACK:
      return g.attack(state, action.payload.source, action.payload.target);

    case gameActions.ATTACK_COMPLETE:
      return Object.assign(state, {attack: null});

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

    case socketActions.FORFEIT: {
      state = Object.assign(state, {winner: action.payload.winner});
      state = triggerSound(state, state.winner === state.player ? 'win.wav' : 'lose.wav');
      return state;
    }

    default:
      return oldState;
  }
}
