import { cloneDeep, isArray, reduce } from 'lodash';

import * as actions from '../actions/game';
import * as socketActions from '../actions/socket';
import { DEFAULT_GAME_FORMAT, DISCONNECT_FORFEIT_TIME_SECS } from '../constants';
import defaultState from '../store/defaultGameState';
import * as w from '../types';
import { saveToLocalStorage } from '../util/browser';
import { replaceCardsInPlayerState } from '../util/cards';
import { id } from '../util/common';
import { GameFormat } from '../util/formats';
import { cleanUpAnimations, logAction, triggerSound } from '../util/game';
import { handleRewriteParseCompleted } from '../util/rewrite';

import g from './handlers/game';

type State = w.GameState;

const PURELY_VISUAL_ACTIONS: w.ActionType[] = [actions.ATTACK_RETRACT, actions.ATTACK_COMPLETE];

export default function game(
  state: State = cloneDeep(defaultState),
  action?: w.Action | w.Action[],
  allowed?: boolean
): State {
  if (isArray(action)) {
    // Allow multiple dispatch - this is primarily useful for simplifying testing.
    return reduce(action, (s: State, a: w.Action) => game(s, a), state);
  } else if (state.tutorial && action && !allowed) {
    // In tutorial mode, only one specific action is allowed at any given time.
    return g.handleTutorialAction(state, action);
  } else {
    return handleAction(state, action);
  }
}

export function handleAction(
  oldState: State,
  { type, payload }: w.Action = { type: '' }
): State {
  // Uncomment to log errors when the game state is ever a recursive structure (which could break multiplayer).
  // JSON.stringify(oldState);

  // First, clone state and clean up any currently running animation (e.g. objects turning red because they took damage).
  let state: State = cleanUpAnimations({ ...oldState });

  if (!PURELY_VISUAL_ACTIONS.includes(type)) {
    state = { ...state, actionId: id() };
  }

  switch (type) {
    case socketActions.GAME_START: {
      const { player, usernames, decks, seed, options } = payload;
      const format: w.Format = payload.format || DEFAULT_GAME_FORMAT;

      state = g.newGame(state, player || 'orange', usernames || {}, decks, seed, format, options || {});

      // Play the countdown sound unless we still need to build the deck (i.e. draft mode)
      if (GameFormat.decode(format).requiresDeck) {
        state = triggerSound(state, 'countdown.wav');
      }

      return state;
    }

    case actions.START_TUTORIAL:
      return g.startTutorial(state);

    case actions.START_PRACTICE:
      return g.startPractice(state, payload.format, payload.deck);

    case actions.START_SANDBOX:
      return g.startSandbox(state, payload.card);

    case actions.AI_RESPONSE:
      return g.aiResponse(state);

    case actions.END_GAME:
      return { ...state, started: false };

    case actions.MOVE_ROBOT:
      return g.moveRobot(state, payload.from, payload.to);

    case actions.ATTACK:
      return g.attack(state, payload.source, payload.target);

    case actions.ATTACK_RETRACT:
      return { ...state, attack: state.attack ? { ...state.attack, retract: true } : null };

    case actions.ATTACK_COMPLETE:
      return g.attackComplete(state);

    case actions.ACTIVATE_OBJECT:
      return g.activateObject(state, payload.abilityIdx);

    case actions.PLACE_CARD:
      return g.placeCard(state, payload.cardIdx, payload.tile);

    case actions.PASS_TURN:
      return g.passTurn(state, payload.player);

    case actions.SET_SELECTED_CARD:
      return g.setSelectedCard(state, payload.player, payload.selectedCard);

    case actions.SET_SELECTED_CARD_IN_DISCARD_PILE:
      return g.setSelectedCardInDiscardPile(state, payload.player, payload.selectedCardId);

    case actions.SET_SELECTED_TILE:
      return g.setSelectedTile(state, payload.player, payload.selectedTile);

    case actions.DESELECT:
      return g.deselect(state, payload.player);

    case actions.ADD_CARD_TO_HAND: {
      // Only to be used in sandbox mode.
      const { player } = payload;
      const card: w.CardInGame = { ...payload.card, id: id() };
      state.players[player as w.PlayerColor].hand.push(card);
      return state;
    }

    case actions.DRAFT_CARDS: {
      return g.draftCards(state, payload.player, payload.cards);
    }

    case actions.SET_VOLUME: {
      saveToLocalStorage('volume', payload.volume);
      return { ...state, volume: payload.volume };
    }

    case actions.IN_GAME_PARSE_COMPLETED:
      return handleRewriteParseCompleted(state, payload);

    case socketActions.DISCONNECTED: {
      if (state.started && !state.winner) {
        state = logAction(state, null, `You have disconnected and will forfeit in ${DISCONNECT_FORFEIT_TIME_SECS} seconds unless you rejoin the game`);
      }
      return state;
    }

    case socketActions.CURRENT_STATE:
      // This is used for spectating an in-progress game - the server sends back a log of all actions so far.
      // But empty the queues so as not to overwhelm the spectator with animations and sounds immediately.
      return {
        ...reduce(payload.actions, (s: State, a: w.Action) => game(s, a), state),
        eventQueue: [],
        sfxQueue: []
      };

    case socketActions.REVEAL_CARDS: {
      const { blue, orange } = payload;
      state.players = {
        blue: replaceCardsInPlayerState(state.players.blue, blue),
        orange: replaceCardsInPlayerState(state.players.orange, orange)
      };
      return state;
    }

    case socketActions.FORFEIT: {
      if (state.draft) {
        // If still drafting, there's no notion of 'forfeiting' - the game just gets aborted
        state = logAction(state, null, 'The draft has been aborted (a player has left)');
        return { ...state, winner: 'aborted' };
      } else {
        state = { ...state, winner: payload.winner };
        state = logAction(state, state.players[payload.winner as w.PlayerColor], 'won the game due to forfeit');
        state = triggerSound(state, state.winner === state.player ? 'win.wav' : 'game-over.wav');
        return state;
      }
    }

    default:
      return oldState;
  }
}
