export const OPEN_FOR_EDITING = 'OPEN_FOR_EDITING';
export const REMOVE_FROM_COLLECTION = 'REMOVE_FROM_COLLECTION';
export const SAVE_DECK = 'SAVE_DECK';

// Note: This action is consumed by the creator reducer!
export function openForEditing(card) {
  return {
    type: OPEN_FOR_EDITING,
    payload: {
      card: card
    }
  };
}

// Note: This action is consumed by the collection AND game reducers!
export function removeFromCollection(ids) {
  return {
    type: REMOVE_FROM_COLLECTION,
    payload: {
      ids: ids
    }
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
