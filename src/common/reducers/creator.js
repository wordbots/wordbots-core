import defaultState from '../store/defaultCreatorState';
import * as creatorActions from '../actions/creator';
import { id } from '../util';

export default function creator(oldState = defaultState, action) {
  const state = Object.assign({}, oldState);

  switch (action.type) {
    case creatorActions.SET_NAME:
      state.name = action.payload.name;
      return state;

    case creatorActions.SET_TYPE:
      state.type = action.payload.type;
      return state;

    case creatorActions.SET_ATTRIBUTE:
      state[action.payload.attr] = isNaN(action.payload.value) ? null : action.payload.value;
      return state;

    case creatorActions.SET_TEXT: {
      const validCurrentParses = _.fromPairs(state.sentences.map(s => [s.sentence, s.result.js]));
      state.sentences = action.payload.sentences.map(sentence => ({
        sentence: sentence,
        result: validCurrentParses[sentence] ? {js: validCurrentParses[sentence]} : {}
      }));
      state.textCleared = false;
      return state;
    }

    case creatorActions.PARSE_COMPLETE:
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

    default:
      return state;
  }
}
