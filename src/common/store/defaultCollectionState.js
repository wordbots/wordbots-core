import {collection} from './cards';

const defaultState = {
  cards: collection,
  decks: [
    {
      id: '[default]',
      name: 'Default',
      cardIds: collection.slice(0, 30).map(c => c.id)
    }
  ],
  currentDeck: null,
  exportedJson: null
};

export default defaultState;
