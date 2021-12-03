import { BLUE_CORE_HEX, ORANGE_CORE_HEX, STARTING_PLAYER_COLOR, TYPE_CORE } from '../constants';
import * as w from '../types';

import * as cards from './cards';

export function bluePlayerState(collection: w.PossiblyObfuscatedCard[]): w.PlayerInGameState {
  return playerState('blue', collection, cards.blueCoreCard, BLUE_CORE_HEX);
}

export function orangePlayerState(collection: w.PossiblyObfuscatedCard[]): w.PlayerInGameState {
  return playerState('orange', collection, cards.orangeCoreCard, ORANGE_CORE_HEX);
}

export function defaultTarget(): w.CurrentTarget {
  return {
    choosing: false,
    chosen: null,
    possibleCardsInHand: [],
    possibleCardsInDiscardPile: [],
    possibleHexes: []
  };
}

function playerState(
  color: w.PlayerColor,
  collection: w.PossiblyObfuscatedCard[],
  coreCard: w.CardInGame,
  coreHexId: string
): w.PlayerInGameState {
  return {
    color,
    energy: {
      available: (color === STARTING_PLAYER_COLOR) ? 1 : 0,
      total: (color === STARTING_PLAYER_COLOR) ? 1 : 0
    },
    hand: collection.slice(0, 2),
    deck: collection.slice(2),
    discardPile: [],
    objectsOnBoard: {
      [coreHexId]: {
        id: `${color}Core`,
        type: TYPE_CORE,
        card: coreCard,
        stats: {...coreCard.stats} as { health: number },
        movesMade: 0,
        triggers: [],
        abilities: [],
        tookDamageThisTurn: false
      }
    },
    selectedCard: null,
    selectedTile: null,
    status: {
      message: '',
      type: ''
    },
    target: defaultTarget()
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
  draft: null,
  winner: null,
  options: {},
  currentTurn: STARTING_PLAYER_COLOR,
  player: STARTING_PLAYER_COLOR,
  usernames: { blue: '', orange: '' },
  actionLog: [],
  attack: null,
  objectsDestroyedThisTurn: {},
  executionStackDepth: 0,
  memory: {},
  sfxQueue: [],
  eventQueue: [],
  rng: Math.random,
  volume: parseInt(localStorage?.[`wb$volume`] || 25)
};

export default defaultGameState;
