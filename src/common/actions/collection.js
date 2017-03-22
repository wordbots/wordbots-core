export const DELETE_DECK = 'DELETE_DECK';
export const OPEN_FOR_EDITING = 'OPEN_FOR_EDITING';
export const REMOVE_FROM_COLLECTION = 'REMOVE_FROM_COLLECTION';
export const SAVE_DECK = 'SAVE_DECK';

export function deleteDeck(deckId) {
  return {
    type: DELETE_DECK,
    payload: {
      deckId: deckId
    }
  };
}

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

export function saveDeck(id, name, cardIds) {
  return {
    type: SAVE_DECK,
    payload: {
      id: id,
      name: name,
      cardIds: cardIds
    }
  };
}
