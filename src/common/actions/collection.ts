import * as w from '../types';

export const DELETE_DECK = 'DELETE_DECK';
export const DELETE_SET = 'DELETE_SET';
export const DUPLICATE_CARD = 'DUPLICATE_CARD';
export const DUPLICATE_DECK = 'DUPLICATE_DECK';
export const DUPLICATE_SET = 'DUPLICATE_SET';
export const EDIT_DECK = 'EDIT_DECK';
export const EDIT_SET = 'EDIT_SET';
export const EXPORT_CARDS = 'EXPORT_CARDS';
export const IMPORT_CARDS = 'IMPORT_CARDS';
export const OPEN_CARD_FOR_EDITING = 'OPEN_CARD_FOR_EDITING';
export const PUBLISH_SET = 'PUBLISH_SET';
export const DELETE_CARDS = 'DELETE_CARDS';
export const SAVE_DECK = 'SAVE_DECK';
export const SAVE_SET = 'SAVE_SET';
export const SELECT_DECK = 'SELECT_DECK';
export const SELECT_FORMAT = 'SELECT_FORMAT';

export function deleteDeck(deckId: w.DeckId): w.Action {
  return {
    type: DELETE_DECK,
    payload: { deckId }
  };
}

export function deleteSet(setId: string): w.Action {
  return {
    type: DELETE_SET,
    payload: { setId }
  };
}

export function duplicateCard(card: w.CardInStore): w.Action {
  return {
    type: DUPLICATE_CARD,
    payload: { card }
  };
}

export function duplicateDeck(deckId: w.DeckId): w.Action {
  return {
    type: DUPLICATE_DECK,
    payload: { deckId }
  };
}

export function duplicateSet(setId: string): w.Action {
  return {
    type: DUPLICATE_SET,
    payload: { setId }
  };
}

export function editDeck(deckId: w.DeckId | null): w.Action {
  return {
    type: EDIT_DECK,
    payload: { deckId }
  };
}

export function editSet(setId: string): w.Action {
  return {
    type: EDIT_SET,
    payload: { setId }
  };
}

export function publishSet(setId: string): w.Action {
  return {
    type: PUBLISH_SET,
    payload: { setId }
  };
}

export function exportCards(cards: w.CardInStore[]): w.Action {
  return {
    type: EXPORT_CARDS,
    payload: { cards }
  };
}

export function importCards(json: string): w.Action {
  return {
    type: IMPORT_CARDS,
    payload: { json }
  };
}

// Note: This action is consumed by the creator reducer!
export function openForEditing(card: w.CardInStore): w.Action {
  return {
    type: OPEN_CARD_FOR_EDITING,
    payload: { card }
  };
}

export function removeFromCollection(ids: w.CardId[]): w.Action {
  return {
    type: DELETE_CARDS,
    payload: { ids }
  };
}

export function saveDeck(id: w.DeckId | null, name: string, cardIds: w.CardId[], setId: string | null): w.Action {
  return {
    type: SAVE_DECK,
    payload: { id, name, cardIds, setId }
  };
}

export function saveSet(set: w.Set): w.Action {
  return {
    type: SAVE_SET,
    payload: { set }
  };
}
