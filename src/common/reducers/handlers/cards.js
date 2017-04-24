import { some } from 'lodash';

import { TYPE_EVENT, TYPE_ROBOT } from '../../constants';
import { id, compareCertainKeys } from '../../util/common';
import { cardsToJson, cardsFromJson, splitSentences } from '../../util/cards';
import { saveToLocalStorage } from '../../store/persistState';

const cardsHandlers = {
  addToCollection: function (state, cardProps) {
    const card = createCardFromProps(cardProps);

    if (cardProps.id) {
      // Editing an existing card.
      const existingCard = state.cards.find(c => c.id === cardProps.id);
      Object.assign(existingCard, card);
    } else {
      if (some(state.cards, c => areIdenticalCards(c, card))) {
        // There's already an identical card in the collection - log some kind of warning to the user.
      } else {
        // Creating a new card.
        state.cards.push(card);
      }
    }

    saveCardsToLocalStorage(state);

    return state;
  },

  closeExportDialog: function (state) {
    return Object.assign({}, state, {exportedJson: null});
  },

  deleteDeck: function (state, deckId) {
    state.decks = state.decks.filter(deck => deck.id !== deckId);
    saveDecksToLocalStorage(state);
    return state;
  },

  exportCards: function (state, cards) {
    return Object.assign({}, state, {exportedJson: cardsToJson(cards)});
  },

  importCards: function (state, json) {
    // Add new cards that are not duplicates.
    cardsFromJson(json)
      .filter(card => !state.cards.map(c => c.id).includes(card.id))
      .forEach(card => { state.cards.unshift(card); });

    saveCardsToLocalStorage(state);

    return state;
  },

  openCardForEditing: function (state, card) {
    return Object.assign(state, {
      id: card.id,
      name: card.name,
      type: card.type,
      spriteID: card.spriteID,
      sentences: splitSentences(card.text).map(s => ({sentence: s, result: {}})),
      energy: card.cost,
      health: (card.stats || {}).health,
      speed: (card.stats || {}).speed,
      attack: (card.stats || {}).attack,
      text: card.text
    });
  },

  openDeckForEditing: function (state, deckId) {
    state.currentDeck = deckId ? state.decks.find(d => d.id === deckId) : null;
    return state;
  },

  removeFromCollection: function (state, ids) {
    state.cards = state.cards.filter(c => !ids.includes(c.id));
    saveCardsToLocalStorage(state);

    return state;
  },

  saveDeck: function (state, deckId, name, cardIds) {
    const cards = cardIds.map(cardId => state.cards.find(c => c.id === cardId));

    if (deckId) {
      // Existing deck.
      Object.assign(state.decks.find(d => d.id === deckId), {
        name: name,
        cards: cards
      });
    } else {
      // New deck.
      state.decks.push({
        id: id(),
        name: name,
        cards: cards
      });
    }

    saveDecksToLocalStorage(state);

    return state;
  }
};

// Converts card from cardCreator store format -> format for collection and game stores.
function createCardFromProps(props) {
  const sentences = props.sentences.filter(s => /\S/.test(s.sentence));
  const command = sentences.map(s => s.result.js);

  const card = {
    id: id(),
    name: props.name,
    type: props.type,
    spriteID: props.spriteID,
    text: sentences.map(s => `${s.sentence}. `).join(''),
    cost: props.cost,
    source: 'user',  // In the future, this will specify *which* user created the card.
    timestamp: Date.now()
  };

  if (props.type === TYPE_EVENT) {
    card.command = command;
  } else {
    card.abilities = command;
    card.stats = {
      health: props.health,
      speed: props.type === TYPE_ROBOT ? props.speed : undefined,
      attack: props.type === TYPE_ROBOT ? props.attack : undefined
    };
  }

  return card;
}

function areIdenticalCards(card1, card2) {
  // TODO: Once we have better UX for this, it's time to start getting stricter
  // (no longer care about the name, and check abilities/command rather than text).
  return compareCertainKeys(card1, card2, ['name', 'type', 'cost', 'text', 'stats']);
}

function saveCardsToLocalStorage(state) {
  saveToLocalStorage('collection', state.cards);
}

function saveDecksToLocalStorage(state) {
  saveToLocalStorage('decks', state.decks);
}

export default cardsHandlers;
