import { TYPE_EVENT, TYPE_ROBOT } from '../../constants';
import { id } from '../../util/common';
import { splitSentences } from '../../util/cards';

const cardsHandlers = {
  addToCollection: function (state, cardProps) {
    const card = createCardFromProps(cardProps);

    if (cardProps.id) {
      // Editing an existing card.
      const existingCard = state.cards.find(c => c.id === cardProps.id);
      Object.assign(existingCard, card);
    } else {
      // Creating a new card.
      state.cards.unshift(card);
    }

    return updateDefaultDeck(state);
  },

  deleteDeck: function (state, deckId) {
    state.decks = state.decks.filter(deck => deck.id !== deckId);
    return state;
  },

  openCardForEditing: function (state, card) {
    return Object.assign(state, {
      id: card.id,
      name: card.name,
      type: card.type,
      spriteID: card.spriteID,
      sentences: splitSentences(card.text).map(s => ({sentence: s, result: {}})),
      cost: card.cost,
      health: card.stats.health,
      speed: card.stats.speed,
      attack: card.stats.attack,
      setText: card.text
    });
  },

  openDeckForEditing: function (state, deckId) {
    state.currentDeck = deckId ? state.decks.find(d => d.id === deckId) : null;
    return state;
  },

  removeFromCollection: function (state, ids) {
    state.cards = state.cards.filter(c => !ids.includes(c.id));
    return updateDefaultDeck(state);
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
    source: 'user'  // In the future, this will specify *which* user created the card.
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

function updateDefaultDeck(state) {
  Object.assign(state.decks.find(d => d.id === '[default]'), {cards: state.cards.slice(0, 30)});
  return state;
}

export default cardsHandlers;
