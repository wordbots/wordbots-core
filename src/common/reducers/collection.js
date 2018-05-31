import { isArray, reduce } from 'lodash';

import defaultState from '../store/defaultCollectionState';
import * as collectionActions from '../actions/collection';
import * as creatorActions from '../actions/creator';
import * as globalActions from '../actions/global';

import c from './handlers/cards';

export default function collection(oldState = defaultState, action) {
  const state = Object.assign({}, oldState);

  if (isArray(action)) {
    // Allow multiple dispatch - this is primarily useful for simplifying testing.
    return reduce(action, collection, state);
  } else {
    switch (action.type) {
      case globalActions.FIREBASE_DATA:
        return c.loadState({...state, firebaseLoaded: true}, action.payload.data);

      case creatorActions.ADD_TO_COLLECTION:
        return c.saveCard(state, action.payload);

      case collectionActions.DELETE_DECK:
        return c.deleteDeck(state, action.payload.deckId);

      case collectionActions.DUPLICATE_DECK:
        return c.duplicateDeck(state, action.payload.deckId);

      case collectionActions.EDIT_DECK:
        return c.openDeckForEditing(state, action.payload.deckId);

      case collectionActions.EXPORT_CARDS:
        return c.exportCards(state, action.payload.cards);

      case collectionActions.IMPORT_CARDS:
        return c.importCards(state, action.payload.json);

      case collectionActions.REMOVE_FROM_COLLECTION:
        return c.deleteCards(state, action.payload.ids);

      case collectionActions.SAVE_DECK:
        return c.saveDeck(state, action.payload.id, action.payload.name, action.payload.cardIds);

      case collectionActions.SELECT_DECK:
        return {...state, selectedDeckIdx: action.payload.deckIdx};

      case collectionActions.SELECT_FORMAT:
        return {...state, selectedFormatIdx: action.payload.formatIdx};

      default:
        return state;
    }
  }
}
