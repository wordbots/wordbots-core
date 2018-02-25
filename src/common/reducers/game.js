import { cloneDeep, isArray, reduce } from 'lodash';

import { id } from '../util/common';
import { triggerSound } from '../util/game';
import * as actions from '../actions/game';
import * as socketActions from '../actions/socket';
import defaultState from '../store/defaultGameState';

import g from './handlers/game';

const PURELY_VISUAL_ACTIONS = [actions.ATTACK_RETRACT, actions.ATTACK_COMPLETE];

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
  let state = Object.assign({}, oldState);

  if (!PURELY_VISUAL_ACTIONS.includes(action.type)) {
    state = Object.assign(state, {
      actionId: id()  // actionId is used to correctly merge actions in the action log.
    });
  }

  switch (action.type) {
    case socketActions.GAME_START:
      return g.newGame(state, action.payload.player || 'orange', action.payload.usernames || {}, action.payload.decks, action.payload.seed);

    case actions.START_TUTORIAL:
      return g.startTutorial(state);

    case actions.START_PRACTICE:
      return g.startPractice(state, action.payload.deck);

    case actions.START_SANDBOX:
      return g.startSandbox(state);

    case actions.AI_RESPONSE:
      return g.aiResponse(state);

    case actions.END_GAME:
      return Object.assign(state, {started: false});

    case actions.MOVE_ROBOT:
      return g.moveRobot(state, action.payload.from, action.payload.to);

    case actions.ATTACK:
      return g.attack(state, action.payload.source, action.payload.target);

    case actions.ATTACK_RETRACT:
      return Object.assign(state, {attack: {...state.attack, retract: true}});

    case actions.ATTACK_COMPLETE:
      return g.attackComplete(state);

    case actions.ACTIVATE_OBJECT:
      return g.activateObject(state, action.payload.abilityIdx);

    case actions.PLACE_CARD:
      return g.placeCard(state, action.payload.cardIdx, action.payload.tile);

    case actions.PASS_TURN:
      return g.passTurn(state, action.payload.player);

    case actions.SET_SELECTED_CARD:
      return g.setSelectedCard(state, action.payload.player, action.payload.selectedCard);

    case actions.SET_SELECTED_TILE:
      return g.setSelectedTile(state, action.payload.player, action.payload.selectedTile);

    case actions.DESELECT:
      return g.deselect(state, action.payload.player);

    case actions.ADD_CARD_TO_TOP_OF_DECK: {
      // Only to be used in sandbox mode.
      const { player } = action.payload;
      const card = { ...action.payload.card, id: id() };
      state.players[player].deck.unshift(card);
      return state;
    }

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
