export const CLOSE_EXPORT_DIALOG = 'CLOSE_EXPORT_DIALOG';
export const DELETE_DECK = 'DELETE_DECK';
export const DUPLICATE_DECK = 'DUPLICATE_DECK';
export const EDIT_DECK = 'EDIT_DECK';
export const EXPORT_CARDS = 'EXPORT_CARDS';
export const IMPORT_CARDS = 'IMPORT_CARDS';
export const OPEN_CARD_FOR_EDITING = 'OPEN_CARD_FOR_EDITING';
export const REMOVE_FROM_COLLECTION = 'REMOVE_FROM_COLLECTION';
export const SAVE_DECK = 'SAVE_DECK';

export function closeExportDialog() {
  return {
    type: CLOSE_EXPORT_DIALOG
  };
}

export function deleteDeck(deckId) {
  return {
    type: DELETE_DECK,
    payload: { deckId }
  };
}

export function duplicateDeck(deckId) {
  return {
    type: DUPLICATE_DECK,
    payload: { deckId }
  };
}

export function editDeck(deckId) {
  return {
    type: EDIT_DECK,
    payload: { deckId }
  };
}

export function exportCards(cards) {
  return {
    type: EXPORT_CARDS,
    payload: { cards }
  };
}

export function importCards(json) {
  return {
    type: IMPORT_CARDS,
    payload: { json }
  };
}

// Note: This action is consumed by the creator reducer!
export function openForEditing(card) {
  return {
    type: OPEN_CARD_FOR_EDITING,
    payload: { card }
  };
}

export function removeFromCollection(ids) {
  return {
    type: REMOVE_FROM_COLLECTION,
    payload: { ids }
  };
}

export function saveDeck(id, name, cardIds) {
  return {
    type: SAVE_DECK,
    payload: { id, name, cardIds }
  };
}
