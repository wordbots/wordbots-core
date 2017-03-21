import { TYPE_EVENT, TYPE_ROBOT } from '../../constants';
import { id, splitSentences } from '../../util';

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

    // In the future there will be multiple decks - for now we just have one with the 30 most recent cards.
    state.decks = [createDefaultDeck(state)];

    return state;
  },

  openForEditing: function (state, card) {
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

  removeFromCollection: function (state, ids) {
    state.cards = state.cards.filter(c => !ids.includes(c.id));

    // In the future there will be multiple decks - for now we just have one with the 30 most recent cards.
    state.decks = [createDefaultDeck(state)];

    return state;
  },

  saveDeck: function (state, deckId, name, cardIds) {
    state.decks.push({
      name: name || `Deck ${id()}`,
      cards: cardIds.map(cardId => state.cards.find(c => c.id === cardId))
    });

    return state;
  }
};

// Converts card from cardCreator store format -> format for collection and game stores.
function createCardFromProps(props) {
  const sentences = props.sentences.filter(s => /\S/.test(s.sentence));
  const command = sentences.map(s => s.result.js);

  const card = {
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

function createDefaultDeck(state) {
  return {
    name: 'Default',
    cards: state.cards.slice(0, 30)
  };
}

export default cardsHandlers;
