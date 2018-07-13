import { fromPairs } from 'lodash';

import { id } from '../util/common.ts';
import { getSentencesFromInput, replaceSynonyms } from '../util/cards.ts';
import defaultState from '../store/defaultCreatorState.ts';
import * as collectionActions from '../actions/collection';
import * as creatorActions from '../actions/creator';

import c from './handlers/cards';

export default function creator(oldState = defaultState, action) {
  const state = Object.assign({}, oldState);

  switch (action.type) {
    case creatorActions.SET_NAME:
      state.name = action.payload.name;
      return state;

    case creatorActions.SET_TYPE:
      state.type = action.payload.type;
      // Clear parsed state because we're triggering a re-parse.
      state.sentences = state.sentences.map(s => Object.assign({}, s, {result: {}}));
      return state;

    case creatorActions.SET_ATTRIBUTE:
      state[action.payload.attr] = isNaN(action.payload.value) ? null : action.payload.value;
      return state;

    case creatorActions.SET_TEXT: {
      const sentences = getSentencesFromInput(action.payload.text);
      const validCurrentParses = fromPairs(state.sentences.map(s => [s.sentence, s.result.js]));

      state.text = replaceSynonyms(action.payload.text);
      state.sentences = sentences.map(sentence => ({
        sentence: sentence,
        result: validCurrentParses[sentence] ? {js: validCurrentParses[sentence]} : {}
      }));
      return state;
    }

    case creatorActions.PARSE_COMPLETE:
      state.parserVersion = action.payload.result.version;
      state.sentences = state.sentences.map((s, idx) => {
        if (idx === action.payload.idx) {
          return Object.assign({}, s, {result: action.payload.result});
        } else {
          return s;
        }
      });
      return state;

    case creatorActions.REGENERATE_SPRITE:
      state.spriteID = id();
      return state;

    case creatorActions.ADD_TO_COLLECTION:
      // Reset card creator state.
      return Object.assign(state, defaultState, { spriteID: id() });

    case collectionActions.OPEN_CARD_FOR_EDITING:
      return c.openCardForEditing(state, action.payload.card);

    default:
      return state;
  }
}
