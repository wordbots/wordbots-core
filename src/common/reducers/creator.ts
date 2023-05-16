import { fromPairs } from 'lodash';

import * as w from '../types';
import * as g from '../guards';
import { expandKeywords, getSentencesFromInput, replaceSynonyms } from '../util/cards';
import { id, md5 } from '../util/common';
import * as collectionActions from '../actions/collection';
import * as creatorActions from '../actions/creator';
import defaultState from '../store/defaultCreatorState';

import c from './handlers/cards';

type State = w.CreatorState;

export default function creator(oldState: State = defaultState, { type, payload }: w.Action): State {
  const state: State = { ...oldState };

  switch (type) {
    case creatorActions.SET_NAME:
      state.name = payload.name;
      return state;

    case creatorActions.SET_TYPE:
      state.type = payload.type;
      // Clear parsed state because we're triggering a re-parse.
      state.sentences = state.sentences.map((s: w.Sentence) => ({ ...s, result: null }));
      state.integrity = [];
      return state;

    case creatorActions.SET_ATTRIBUTE:
      state[payload.attr as w.Attribute | 'cost'] = isNaN(payload.value) ? null : payload.value;
      return state;

    case creatorActions.SET_TEXT: {
      const sentences: string[] = getSentencesFromInput(payload.text);
      const validCurrentParses: Record<string, w.SuccessfulParseResult> = fromPairs(
        state.sentences
          .map((s: w.Sentence) => [s.sentence, s.result] as [string, w.ParseResult])
          .filter(([_, r]) => r && g.isSuccessfulParseResult(r)) as Array<[string, w.SuccessfulParseResult]>
      );

      state.text = replaceSynonyms(payload.text);
      state.textSource = payload.textSource;
      state.sentences = sentences.map((sentence: string) => ({
        sentence,
        result: validCurrentParses[sentence] || {}
      }));

      const sentenceHashes: string[] = sentences.map((s) => md5(expandKeywords(s)));
      state.integrity = state.integrity.filter(({ input }) => sentenceHashes.includes(input));

      return state;
    }

    case creatorActions.SET_FLAVOR_TEXT:
      state.flavorText = payload.flavorText;
      return state;

    case creatorActions.PARSE_COMPLETE: {
      const result: w.ParseResult = payload.result;

      state.parserVersion = result.version;
      state.sentences = state.sentences.map((s: w.Sentence, idx) => ({
        ...s,
        result: (idx === payload.idx && s.sentence === payload.sentence) ? result : s.result
      }));

      if ('hashes' in result) {
        state.integrity.push(result.hashes);
      }

      return state;
    }

    case creatorActions.REGENERATE_SPRITE:
      state.spriteID = id();
      return state;

    case creatorActions.TOGGLE_WILL_CREATE_ANOTHER:
      return { ...state, willCreateAnother: !state.willCreateAnother };

    case creatorActions.TOGGLE_PRIVATE:
      return { ...state, isPrivate: !state.isPrivate };

    case creatorActions.SAVE_CARD:
    case creatorActions.ADD_EXISTING_CARD_TO_COLLECTION:
    case creatorActions.RESET_CREATOR:
      return {
        ...defaultState,
        willCreateAnother: state.willCreateAnother,
        spriteID: id()
      };

    case creatorActions.SAVE_TEMP_VERSION:
      return { ...state, tempSavedVersion: payload.card };

    case collectionActions.OPEN_CARD_FOR_EDITING:
      return c.openCardForEditing(state, payload.card);

    default:
      return state;
  }
}
