import { isArray, reduce } from 'lodash';

import defaultState from '../store/defaultCollectionState';
import * as collectionActions from '../actions/collection';
import * as creatorActions from '../actions/creator';

import c from './handlers/cards';

export default function collection(oldState = defaultState, action) {
  const state = Object.assign({}, oldState);

  if (isArray(action)) {
    // Allow multiple dispatch - this is primarily useful for simplifying testing.
    return reduce(action, collection, state);
  } else {
    switch (action.type) {
      case creatorActions.ADD_TO_COLLECTION:
        return c.addToCollection(state, action.payload);

      case collectionActions.REMOVE_FROM_COLLECTION:
        return c.removeFromCollection(state, action.payload.ids);

      default:
        return state;
    }
  }
}
