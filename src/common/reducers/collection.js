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

      case collectionActions.DELETE_DECK:
        return c.deleteDeck(state, action.payload.deckId);

      case collectionActions.EDIT_DECK:
        return c.openDeckForEditing(state, action.payload.deckId);

      case collectionActions.REMOVE_FROM_COLLECTION:
        return c.removeFromCollection(state, action.payload.ids);

      case collectionActions.SAVE_DECK:
        return c.saveDeck(state, action.payload.id, action.payload.name, action.payload.cardIds);

      default:
        return state;
    }
  }
}
