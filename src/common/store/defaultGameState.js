import * as cards from './cards';

export function player(color, collection, coreCard, coreHexId) {
  return {
    name: color,
    energy: {
      available: 1,
      total: 1
    },
    hand: collection.slice(0, 2),
    deck: collection.slice(2),
    collection: collection,
    robotsOnBoard: {
      [coreHexId]: {
        id: `${color}Core`,
        card: coreCard,
        stats: coreCard.stats,
        movesLeft: 0
      }
    }
  };
}

const defaultState = {
  players: {
    blue: player('blue', cards.collection, cards.blueCoreCard, '-4,0,4'),
    orange: player('orange', cards.collection, cards.orangeCoreCard, '4,0,-4')
  },
  currentTurn: 'orange',
  selectedTile: null,
  selectedCard: null,
  playingCardType: null,
  hoveredCard: null,
  status: {
    message: '',
    type: ''
  },
  target: {
    choosing: false,
    chosen: null,
    possibleCards: [],
    possibleHexes: []
  },
  winner: null
};

export default defaultState;
