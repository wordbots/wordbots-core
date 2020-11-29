import { fromPairs } from 'lodash';

import * as collectionActions from '../actions/collection';
import * as creatorActions from '../actions/creator';
import defaultState from '../store/defaultCreatorState';
import * as w from '../types';
import { getSentencesFromInput, replaceSynonyms } from '../util/cards';
import { id } from '../util/common';

import c from './handlers/cards';

type State = w.CreatorState;

export default function creator(oldState: State = defaultState, { type, payload }: w.Action): State {
  const state: State = {...oldState};

  switch (type) {
    case creatorActions.SET_NAME:
      state.name = payload.name;
      return state;

    case creatorActions.SET_TYPE:
      state.type = payload.type;
      // Clear parsed state because we're triggering a re-parse.
      state.sentences = state.sentences.map((s: w.Sentence) => ({...s, result: {}}));
      return state;

    case creatorActions.SET_ATTRIBUTE:
      state[payload.attr as w.Attribute | 'cost'] = isNaN(payload.value) ? null : payload.value;
      return state;

    case creatorActions.SET_TEXT: {
      const sentences: string[] = getSentencesFromInput(payload.text);
      const validCurrentParses: Record<string, string> = fromPairs(state.sentences.map((s: w.Sentence) =>
        [s.sentence, s.result.js]
      )) as Record<string, string>;

      state.text = replaceSynonyms(payload.text);
      state.sentences = sentences.map((sentence: string) => ({
        sentence,
        result: validCurrentParses[sentence] ? {js: validCurrentParses[sentence]} : {}
      }));
      return state;
    }

    case creatorActions.PARSE_COMPLETE:
      state.parserVersion = payload.result.version;
      state.sentences = state.sentences.map((s, idx) => {
        if (idx === payload.idx) {
          return {...s, result: payload.result};
        } else {
          return s;
        }
      });
      return state;

    case creatorActions.REGENERATE_SPRITE:
      state.spriteID = id();
      return state;

    case creatorActions.TOGGLE_WILL_CREATE_ANOTHER:
      return {...state, willCreateAnother: !state.willCreateAnother};

    case creatorActions.TOGGLE_PRIVATE:
      return {...state, isPrivate: !state.isPrivate};

    case creatorActions.SAVE_CARD:
    case creatorActions.ADD_EXISTING_CARD_TO_COLLECTION:
    case creatorActions.RESET_CREATOR:
      return {
        ...defaultState,
        willCreateAnother: state.willCreateAnother,
        spriteID: id()
      };

    case collectionActions.OPEN_CARD_FOR_EDITING:
      return c.openCardForEditing(state, payload.card);

    default:
      return state;
  }
}
