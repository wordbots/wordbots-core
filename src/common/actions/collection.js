export const REMOVE_FROM_COLLECTION = 'REMOVE_FROM_COLLECTION';
export const SAVE_DECK = 'SAVE_DECK';

// Note: This actions is consumed by the collection AND game reducers!
export function removeFromCollection(ids) {
  return {
    type: REMOVE_FROM_COLLECTION,
    ids: ids
  };
}

export function saveDeck(ids) {
  return {
    type: SAVE_DECK,
    payload: {
      ids: ids
    }
  };
}
