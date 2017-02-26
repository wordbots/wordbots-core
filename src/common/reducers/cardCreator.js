import defaultState from '../store/defaultCardCreatorState';
import * as cardCreatorActions from '../actions/cardCreator';

export default function cardCreator(oldState = defaultState, action) {
  let state = Object.assign({}, oldState);

  switch (action.type) {
    case cardCreatorActions.SET_NAME:
      state.name = action.payload.name;
      return state;

    case cardCreatorActions.SET_TYPE:
      state.type = action.payload.type;
      return state;

    case cardCreatorActions.SET_TEXT: {
      const validCurrentParses = _.fromPairs(state.sentences.map(s => [s.sentence, s.result.js]));
      state.sentences = action.payload.text.split(/[\\.!\?]/).map(sentence => ({
        sentence: sentence,
        result: validCurrentParses[sentence] ? {js: validCurrentParses[sentence]} : {}
      }));
      return state;
    }

    case cardCreatorActions.PARSE_COMPLETE:
      state.sentences = state.sentences.map((s, idx) => {
        if (idx == action.payload.idx) {
          return Object.assign({}, s, {result: action.payload.result});
        } else {
          return s;
        }
      });
      return state;

    default:
      return state;
  }
}
