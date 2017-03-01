import defaultState from '../store/defaultCollectionState';
import * as creatorActions from '../actions/creator';

import c from './handlers/cards';

export default function collection(oldState = defaultState, action) {
  const state = Object.assign({}, oldState);

  switch (action.type) {
    case creatorActions.ADD_TO_COLLECTION:
      return c.addToCollection(state, action.payload);

    default:
      return state;
  }
}
