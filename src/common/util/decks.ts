import { compact, orderBy, shuffle } from 'lodash';

import { KEEP_DECKS_UNSHUFFLED } from '../constants';
import * as w from '../types';

import { instantiateCard } from './cards';

export function cardsInDeck(deck: w.DeckInStore, userCards: w.CardInStore[], sets: w.Set[]): w.CardInStore[] {
  const set: w.Set | null = deck.setId && sets.find((s) => s.id === deck.setId) || null;
  const cardPool = set ? set.cards : userCards;
  return compact((deck.cardIds || []).map((id) => cardPool.find((c) => c.id === id)));
}

export function shuffleCardsInDeck(deck: w.DeckInStore, userCards: w.CardInStore[], sets: w.Set[]): w.CardInGame[] {
  const unshuffledCards = cardsInDeck(deck, userCards, sets);
  const potentiallyShuffledCards = KEEP_DECKS_UNSHUFFLED ? unshuffledCards : shuffle(unshuffledCards);
  return potentiallyShuffledCards.map(instantiateCard);
}

// "Unpacks" a deck so that it can be used in a game.
// { cardIds } => { cardIds, cards }
export function unpackDeck(deck: w.DeckInStore, userCards: w.CardInStore[], sets: w.Set[]): w.DeckInGame {
  return { ...deck, cards: shuffleCardsInDeck(deck, userCards, sets) };
}

// Note: this method is parametrized because it needs to support both Deck and DeckInStore.
// eslint-disable-next-line import/prefer-default-export
export function sortDecks<T extends w.DeckInStore>(decks: T[]): T[] {
  const decksWithTimestamps: T[] = decks.map((deck: T) => {
    if (deck.timestamp) {
      return deck;                      // Deck has a timestamp
    } else if (deck.id[0] === '[') {
      return { ...(deck as w.DeckInStore), timestamp: 0 } as T; // Deck is built-in
    } else {
      return { ...(deck as w.DeckInStore), timestamp: 1 } as T; // Deck is user-created, but doesn't have a timestamp
    }
  });
  return orderBy(decksWithTimestamps, ['timestamp'], ['desc']);
}
