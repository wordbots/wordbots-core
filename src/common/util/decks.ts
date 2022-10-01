import { compact, orderBy, shuffle } from 'lodash';

import { KEEP_DECKS_UNSHUFFLED } from '../constants';
import * as w from '../types';

import { instantiateCard } from './cards';

/** Given a DeckInStore, a user's pool of cards, and a list of sets,
  * return an array of the (unshuffled) cards in the deck. */
export function cardsInDeck(deck: w.DeckInStore, userCards: w.CardInStore[], sets: w.Set[]): w.CardInStore[] {
  const set: w.Set | null = deck.setId && sets.find((s) => s.id === deck.setId) || null;
  const cardPool = set ? set.cards : userCards;
  return compact((deck.cardIds || []).map((id) => cardPool.find((c) => c.id === id)));
}

/** Given a DeckInStore, a user's pool of cards, and a list of sets,
  * return a shuffled array of the cards in the deck. */
export function shuffleCardsInDeck(deck: w.DeckInStore, userCards: w.CardInStore[], sets: w.Set[]): w.CardInGame[] {
  const unshuffledCards = cardsInDeck(deck, userCards, sets);
  const potentiallyShuffledCards = KEEP_DECKS_UNSHUFFLED ? unshuffledCards : shuffle(unshuffledCards);
  return potentiallyShuffledCards.map(instantiateCard);
}

/** Given a DeckInStore, returns an "unpacked" DeckInGame so that it can be used in a game.
  * i.e. materializes the cards in the deck: { cardIds } => { cardIds, cards } */
export function unpackDeck(deck: w.DeckInStore, userCards: w.CardInStore[], sets: w.Set[]): w.DeckInGame {
  return { ...deck, cards: shuffleCardsInDeck(deck, userCards, sets) };
}

/** Sorts an array of decks, by timestamp descending for user decks, followed by built-in decks.
  * Note: this method is parameterized because it needs to support both Deck and DeckInStore. */
export function sortDecks<T extends w.DeckInStore>(decks: T[]): T[] {
  const decksWithTimestamps: T[] = decks.map((deck: T) => {
    if (deck.timestamp) {
      return deck;  // Deck has a timestamp
    } else if (deck.id[0] === '[') {
      return { ...(deck as w.DeckInStore), timestamp: 0 } as T; // Deck is built-in
    } else {
      return { ...(deck as w.DeckInStore), timestamp: 1 } as T; // Deck is user-created, but doesn't have a timestamp
    }
  });
  return orderBy(decksWithTimestamps, ['timestamp'], ['desc']);
}
