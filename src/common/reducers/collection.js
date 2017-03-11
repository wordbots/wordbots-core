import defaultState from '../store/defaultCollectionState';
import * as collectionActions from '../actions/collection';
import * as creatorActions from '../actions/creator';

import c from './handlers/cards';

export default function collection(oldState = defaultState, action) {
  const state = Object.assign({}, oldState);

  switch (action.type) {
    case creatorActions.ADD_TO_COLLECTION:
      return c.addToCollection(state, action.payload);

    case collectionActions.REMOVE_FROM_COLLECTION:
      return c.removeFromCollection(state, action.ids);

    default:
      return state;
  }
}
