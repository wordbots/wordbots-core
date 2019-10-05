import { isUndefined, omitBy, pick } from 'lodash';

import * as w from '../../types';
import {
  areIdenticalCards, cardsFromJson, cardsToJson, createCardFromProps, loadCardsFromFirebase,
  loadDecksFromFirebase, loadSetsFromFirebase, saveDecksToFirebase, splitSentences
} from '../../util/cards';
import { id } from '../../util/common';
import * as firebase from '../../util/firebase';

type State = w.CollectionState;

const cardsHandlers = {
  deleteCards: (state: State, ids: string[]): State => {
    state.cards = state.cards.filter((c: w.CardInStore) => !ids.includes(c.id));
    // The firebase update needs to run right after we finish handling the delete action,
    // to avoid "You may not call store.getState() while the reducer is executing" exceptions
    setTimeout(() => firebase.removeCards(ids), 0);
    return state;
  },

  deleteDeck: (state: State, deckId: string): State => {
    state.decks = state.decks.filter((deck: w.DeckInStore) => deck.id !== deckId);
    saveDecksToFirebase(state);
    firebase.removeDeck(deckId);
    return state;
  },

  deleteSet: (state: State, setId: string): State => {
    firebase.removeSet(setId);
    return {
      ...state,
      sets: state.sets.filter((set: w.Set) => set.id !== setId)
    };
  },

  duplicateCard: (state: State, originalCard: w.CardInStore): State => {
    const currentUser = firebase.lookupCurrentUser();

    if (currentUser) {
      const duplicateCard: w.CardInStore = {
        ...originalCard,
        id: id(),
        name: `Copy of ${originalCard.name}`,
        metadata: {
          source: { type: 'user', uid: currentUser.uid, username: currentUser.displayName! },
          created: Date.now(),
          updated: Date.now(),
          duplicatedFrom: originalCard.id,
          isPrivate: false,
        }
      };

      saveCard(state, duplicateCard);
    }

    return state;
  },

  duplicateDeck: (state: State, deckId: string): State => {
    const deck: w.DeckInStore = state.decks.find((d) => d.id === deckId)!;
    const copy: w.DeckInStore = {
      ...deck,
      id: id(),
      name: `${deck.name} Copy`,
      timestamp: Date.now()
    };

    state.decks.push(copy);
    saveDecksToFirebase(state);
    return state;
  },

  duplicateSet: (state: State, setId: string): State => {
    const set: w.Set = state.sets.find((d) => d.id === setId)!;
    const versionMatch = set.name.match('v(\d+)^');
    const version: number = versionMatch && parseInt(versionMatch[1], 10) || 1;

    const copy: w.Set = {
      ...set,
      id: id(),
      name: `${set.name.split(/v(\d+)^/)[0]} v${version + 1}`,
      metadata: {
        ...set.metadata,
        isPublished: false,
        lastModified: Date.now()
      }
    };

    firebase.saveSet(copy);
    return {
      ...state,
      sets: [...state.sets, copy]
    };
  },

  exportCards: (state: State, cards: w.CardInStore[]): State => {
    return {...state, exportedJson: cardsToJson(cards)};
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
    const newFields: Partial<w.CreatorState> = {
      ...pick(card, ['id', 'name', 'type', 'text', 'cost', 'spriteID']),
      health: card.stats ? card.stats.health : undefined,
      speed: card.stats ? card.stats.speed : undefined,
      attack: card.stats ? card.stats.attack : undefined,
      sentences: splitSentences(card.text || '').map((s) => ({sentence: s, result: {}}))
    };

    return {...state, ...omitBy(newFields, isUndefined)};
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

  saveExistingCard: (state: State, card: w.CardInStore): State => {
    // e.g. used when importing a card from the RecentCardsCarousel
    return saveCard(state, card);
  },

  saveDeck: (state: State, deckId: string, name: string, cardIds: string[] = [], setId: string | null = null): State => {
    let deck: w.DeckInStore | undefined;
    if (deckId) {
      // Existing deck.
      deck = state.decks.find((d) => d.id === deckId);
      Object.assign(deck, { name, cardIds });
    } else {
      // New deck.
      deck = {
        id: id(),
        name,
        cardIds,
        timestamp: Date.now(),
        setId
      };
      state.decks.push(deck);
    }

    saveDecksToFirebase(state);
    if (deck) {
      firebase.saveDeck(deck);
    }

    return state;
  },

  saveSet: (state: State, set: w.Set) => {
    firebase.saveSet(set);
    return {
      ...state,
      sets: [...state.sets.filter((s) => s.id !== set.id), set]
    };
  }
};

// Saves a card, either as a new card or replacing an existing card.
function saveCard(state: State, card: w.CardInStore): State {

  // Is there already a card with the same ID (i.e. we're currently editing it)
  // or that is identical to the saved card (i.e. we're replacing it with a card with the same name)?
  const existingCard = state.cards.find((c) => c.id === card.id || areIdenticalCards(c, card));

  if (existingCard) {
    // Editing an existing card.
    const { source } = existingCard.metadata;
    if (!source || source.type === 'builtin' || source.uid !== firebase.lookupCurrentUser()!.uid) {
      // TODO Log warning about not being about not being able to replace builtin cards.
    } else {
      Object.assign(existingCard, card, {id: existingCard.id});
    }
  } else {
    state.cards.push(card);
    firebase.saveCard(card);
  }

  return state;
}

export default cardsHandlers; // tslint:disable-line export-name
