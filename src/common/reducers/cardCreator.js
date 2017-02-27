import defaultState from '../store/defaultCardCreatorState';
import * as cardCreatorActions from '../actions/cardCreator';

export default function cardCreator(oldState = defaultState, action) {
  const state = Object.assign({}, oldState);

  switch (action.type) {
    case cardCreatorActions.SET_NAME:
      state.name = action.payload.name;
      return state;

    case cardCreatorActions.SET_TYPE:
      state.type = action.payload.type;
      return state;

    case cardCreatorActions.SET_ATTACK:
      state.attack = action.payload.attack;
      return state;

    case cardCreatorActions.SET_SPEED:
      state.speed = action.payload.speed;
      return state;

    case cardCreatorActions.SET_HEALTH:
      state.health = action.payload.health;
      return state;

    case cardCreatorActions.SET_ENERGY:
      state.energy = action.payload.energy;
      return state;

    case cardCreatorActions.SET_TEXT: {
      const validCurrentParses = _.fromPairs(state.sentences.map(s => [s.sentence, s.result.js]));
      state.sentences = action.payload.sentences.map(sentence => ({
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

    case cardCreatorActions.REGENERATE_SPRITE:
      state.spriteID = Math.random().toString(36).slice(2, 16);
      return state;

    case cardCreatorActions.ADD_TO_COLLECTION:
      state.name = '';
      state.spriteID = Math.random().toString(36).slice(2, 16);
      state.type = 0;
      state.attack = 1;
      state.speed = 1;
      state.health = 1;
      state.energy = 1;
      state.sentences = [];
      return state;

    default:
      return state;
  }
}
