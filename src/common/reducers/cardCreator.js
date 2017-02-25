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

    default:
      return state;
  }
}
