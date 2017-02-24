import { BLUE_CORE_HEX, ORANGE_CORE_HEX } from '../constants';

import * as cards from './cards';

function player(color, coreCard, coreHexId) {
  return {
    name: color,
    energy: {
      available: 1,
      total: 1
    },
    hand: cards.deck.slice(0, 2),
    deck: cards.deck.slice(2),
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
    blue: player('blue', cards.blueCoreCard, BLUE_CORE_HEX),
    orange: player('orange', cards.orangeCoreCard, ORANGE_CORE_HEX)
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
