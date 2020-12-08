import { BLUE_CORE_HEX, ORANGE_CORE_HEX, TYPE_CORE } from '../constants';
import * as w from '../types';

import * as cards from './cards';

const STARTING_PLAYER = 'orange';

export function bluePlayerState(collection: w.PossiblyObfuscatedCard[]): w.PlayerInGameState {
  return playerState('blue', collection, cards.blueCoreCard, BLUE_CORE_HEX);
}

export function orangePlayerState(collection: w.PossiblyObfuscatedCard[]): w.PlayerInGameState {
  return playerState('orange', collection, cards.orangeCoreCard, ORANGE_CORE_HEX);
}

export function arbitraryPlayerState(): w.PlayerInGameState {
  return bluePlayerState([]);
}

function playerState(
  color: w.PlayerColor,
  collection: w.PossiblyObfuscatedCard[],
  coreCard: w.CardInGame,
  coreHexId: string
): w.PlayerInGameState {
  return {
    name: color,
    energy: {
      available: (color === STARTING_PLAYER) ? 1 : 0,
      total: (color === STARTING_PLAYER) ? 1 : 0
    },
    hand: collection.slice(0, 2),
    deck: collection.slice(2),
    discardPile: [],
    robotsOnBoard: {
      [coreHexId]: {
        id: `${color}Core`,
        type: TYPE_CORE,
        card: coreCard,
        stats: {...coreCard.stats} as { health: number },
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
      possibleCardsInHand: [],
      possibleCardsInDiscardPile: [],
      possibleHexes: []
    }
  };
}

const defaultGameState: w.GameState = {
  storeKey: 'game',
  players: {
    blue: bluePlayerState([]),
    orange: orangePlayerState([])
  },
  gameFormat: 'normal',
  started: false,
  tutorial: false,
  practice: false,
  sandbox: false,
  winner: null,
  options: {},
  currentTurn: STARTING_PLAYER,
  player: STARTING_PLAYER,
  usernames: { blue: '', orange: '' },
  actionLog: [],
  attack: null,
  memory: {},
  sfxQueue: [],
  eventQueue: [],
  rng: Math.random,
  volume: 25
};

export default defaultGameState;
