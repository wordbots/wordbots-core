import defaultState from '../store/defaultCardCreatorState';
import * as cardCreatorActions from '../actions/cardCreator';
import { id } from '../util';

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
      state.attack = isNaN(action.payload.attack) ? null : action.payload.attack;
      return state;

    case cardCreatorActions.SET_SPEED:
      state.speed = isNaN(action.payload.speed) ? null : action.payload.speed;
      return state;

    case cardCreatorActions.SET_HEALTH:
      state.health = isNaN(action.payload.health) ? null : action.payload.health;
      return state;

    case cardCreatorActions.SET_ENERGY:
      state.energy = isNaN(action.payload.energy) ? null : action.payload.energy;
      return state;

    case cardCreatorActions.SET_TEXT: {
      const validCurrentParses = _.fromPairs(state.sentences.map(s => [s.sentence, s.result.js]));
      state.sentences = action.payload.sentences.map(sentence => ({
        sentence: sentence,
        result: validCurrentParses[sentence] ? {js: validCurrentParses[sentence]} : {}
      }));
      state.textCleared = false;
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
      state.spriteID = id();
      return state;

    case cardCreatorActions.ADD_TO_COLLECTION:
      state.name = '';
      state.spriteID = id();
      state.type = 0;
      state.attack = 1;
      state.speed = 1;
      state.health = 1;
      state.energy = 1;
      state.sentences = [];
      state.textCleared = true;
      return state;

    default:
      return state;
  }
}
