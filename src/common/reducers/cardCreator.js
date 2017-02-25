import defaultState from '../store/defaultCardCreatorState';
import * as cardCreatorActions from '../actions/cardCreator';

export default function cardCreator(oldState = defaultState, action) {
  let state = Object.assign({}, oldState);

  switch (action.type) {
    case cardCreatorActions.SET_NAME:
      state.name = action.payload.name;
      return state;

    default:
      return state;
  }
}
