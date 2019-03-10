import * as w from '../../types';
import { id } from '../../util/common';
import * as firebase from '../../util/firebase';
import {
  areIdenticalCards, cardsToJson, cardsFromJson, splitSentences, createCardFromProps,
  loadCardsFromFirebase, loadDecksFromFirebase, saveCardToFirebase, saveCardsToFirebase, saveDecksToFirebase, loadSetsFromFirebase
} from '../../util/cards';

type State = w.CollectionState;

const cardsHandlers = {
  deleteCards: (state: State, ids: string[]): State => {
    state.cards = state.cards.filter((c: w.CardInStore) => !ids.includes(c.id));
    saveCardsToFirebase(state);
    return state;
  },

  deleteDeck: (state: State, deckId: string): State => {
    state.decks = state.decks.filter((deck: w.DeckInStore) => deck.id !== deckId);
    saveDecksToFirebase(state);
    return state;
  },

  deleteSet: (state: State, setId: string): State => {
    firebase.removeSet(setId);
    return {
      ...state,
      sets: state.sets.filter((set: w.Set) => set.id !== setId)
    };
  },

  duplicateDeck: (state: State, deckId: string): State => {
    const deck: w.DeckInStore = state.decks.find((d) => d.id === deckId)!;
    const copy: w.DeckInStore = Object.assign({}, deck, {
      id: id(),
      name: `${deck.name} Copy`,
      timestamp: Date.now()
    });

    state.decks.push(copy);
    saveDecksToFirebase(state);
    return state;
  },

  exportCards: (state: State, cards: w.Card[]): State => {
    return Object.assign({}, state, {exportedJson: cardsToJson(cards)});
  },

  importCards: (state: State, json: string): State => {
    cardsFromJson(json, (card) => { saveCard(state, card); });
    return state;
  },

  loadState: (state: State, data: any): State => {
    const defaultDecks: w.DeckInStore[] = state.decks.filter((deck) => deck.id.startsWith('[default-'));

    state = loadCardsFromFirebase(state, data);
    state = loadDecksFromFirebase(state, data);
    state = loadSetsFromFirebase(state, data);

    defaultDecks.forEach((defaultDeck) => {
      if (!state.decks.find((deck) => deck.id === defaultDeck.id)) {
        state.decks.push(defaultDeck);
      }
    });

    return state;
  },

  openCardForEditing: (state: w.CreatorState, card: w.CardInStore): w.CreatorState => {
    return Object.assign(state, {
      id: card.id,
      name: card.name,
      type: card.type,
      spriteID: card.spriteID,
      sentences: splitSentences(card.text || '').map((s) => ({sentence: s, result: {}})),
      energy: card.cost,
      health: card.stats ? card.stats.health : undefined,
      speed: card.stats ? card.stats.speed : undefined,
      attack: card.stats ? card.stats.attack : undefined,
      text: card.text
    });
  },

  openDeckForEditing: (state: State, deckId: string): State => {
    state.deckBeingEdited = deckId ? state.decks.find((d) => d.id === deckId)! : null;
    return state;
  },

  openSetForEditing: (state: State, setId: string): State => {
    return {
      ...state,
      setBeingEdited: setId && state.sets.find((s) => s.id === setId) || null
    };
  },

  publishSet: (state: State, setId: string): State => {
    const set: w.Set | undefined = state.sets.find((s) => s.id === setId);

    if (!set) {
      return state;
    }

    const publishedSet: w.Set = {...set, metadata: {...set.metadata, isPublished: true }};
    firebase.saveSet(publishedSet);

    return {
      ...state,
      sets: [...state.sets.filter((s) => s.id !== setId), publishedSet]
    };
  },

  saveCard: (state: State, cardProps: w.CreatorState): State => {
    const card = createCardFromProps(cardProps);
    return saveCard(state, card);
  },

  saveDeck: (state: State, deckId: string, name: string, cardIds: string[] = [], setId: string | null = null): State => {
    if (deckId) {
      // Existing deck.
      const deck = state.decks.find((d) => d.id === deckId);
      Object.assign(deck, { name, cardIds });
    } else {
      // New deck.
      state.decks.push({
        id: id(),
        name,
        cardIds,
        timestamp: Date.now(),
        setId
      });
    }

    saveDecksToFirebase(state);

    return state;
  },

  saveSet: (state: State, set: w.Set) => {
    firebase.saveSet(set);
    return {
      ...state,
      sets: [...state.sets.filter((s) => s.id !== set.id), set]
    };
  },
};

// Saves a card, either as a new card or replacing an existing card.
function saveCard(state: State, card: w.CardInStore): State {
  // Is there already a card with the same ID (i.e. we're currently editing it)
  // or that is identical to the saved card (i.e. we're replacing it with a card with the same name)?
  const existingCard = state.cards.find((c) => c.id === card.id || areIdenticalCards(c, card));

  if (existingCard) {
    // Editing an existing card.
    if (existingCard.source === 'builtin') {
      // TODO Log warning about not being about not being able to replace builtin cards.
    } else {
      Object.assign(existingCard, card, {id: existingCard.id});
    }
  } else {
    state.cards.push(card);
  }

  saveCardToFirebase(card);
  saveCardsToFirebase(state);
  return state;
}

export default cardsHandlers;
