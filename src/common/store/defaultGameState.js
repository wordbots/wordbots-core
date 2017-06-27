import { BLUE_CORE_HEX, ORANGE_CORE_HEX } from '../constants';

import * as cards from './cards';

const STARTING_PLAYER = 'orange';

export function bluePlayerState(collection) {
  return playerState('blue', collection, cards.blueCoreCard, BLUE_CORE_HEX);
}

export function orangePlayerState(collection) {
  return playerState('orange', collection, cards.orangeCoreCard, ORANGE_CORE_HEX);
}

export function arbitraryPlayerState() {
  return bluePlayerState([]);
}

function playerState(color, collection, coreCard, coreHexId) {
  return {
    name: color,
    energy: {
      available: (color === STARTING_PLAYER) ? 1 : 0,
      total: (color === STARTING_PLAYER) ? 1 : 0
    },
    hand: collection.slice(0, 2),
    deck: collection.slice(2),
    collection: collection,
    robotsOnBoard: {
      [coreHexId]: {
        id: `${color}Core`,
        card: coreCard,
        stats: Object.assign({}, coreCard.stats),
        movesMade: 0,
        triggers: [],
        abilities: []
      }
    },
    selectedCard: null,
    selectedTile: null,
    status: {
      message: '',
      type: ''
    },
    target: {
      choosing: false,
      chosen: null,
      possibleCards: [],
      possibleHexes: []
    }
  };
}

const defaultState = {
  storeKey: 'game',
  players: {
    blue: bluePlayerState([]),
    orange: orangePlayerState([])
  },
  started: false,
  tutorial: false,
  practice: false,
  winner: null,
  currentTurn: STARTING_PLAYER,
  player: STARTING_PLAYER,
  usernames: {},
  hoveredCard: null,
  actionLog: [],
  memory: {},
  sfxQueue: []
};

export default defaultState;
