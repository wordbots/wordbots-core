
import { TYPE_EVENT, TYPE_ROBOT } from '../../constants';
import { instantiateCard, newGame } from '../../util';

const cardsHandlers = {
  addToCollection: function (state, cardProps) {
    const card = createCardFromProps(cardProps);

    if (state.storeKey === 'game') {
      // Game state
      // (Treat both players' collection as the same for now.)
      const collection = [card].concat(state.players.orange.collection);
      return newGame(state, {blue: collection, orange: collection});
    } else {
      // Collection state
      state.cards.unshift(card);
      return state;
    }
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
    cost: props.cost
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

export default cardsHandlers;
