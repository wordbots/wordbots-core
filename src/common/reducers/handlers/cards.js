
import { TYPE_EVENT, TYPE_ROBOT } from '../../constants';
import { instantiateCard } from '../../util';

const cardsHandlers = {
  addToCollection: function (state, cardProps) {
    const card = createCardFromProps(cardProps);
    state.cards.unshift(card);

    // In the future there will be multiple decks - for now we just have one with the 30 most recent cards.
    state.decks = [createDefaultDeck(state)];

    return state;
  },

  removeFromCollection: function (state, ids) {
    state.cards = state.cards.filter(c => !ids.includes(c.id));

    // In the future there will be multiple decks - for now we just have one with the 30 most recent cards.
    state.decks = [createDefaultDeck(state)];

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
      speed: props.type === TYPE_ROBOT ? props.attack : undefined,
      attack: props.type === TYPE_ROBOT ? props.attack : undefined
    };
  }

  return instantiateCard(card);
}

function createDefaultDeck(state) {
  return {
    name: 'Default',
    cards: state.cards.slice(0, 30)
  };
}

export default cardsHandlers;
