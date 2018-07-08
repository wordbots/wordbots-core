import { cloneDeep, shuffle } from 'lodash';
import * as seededRNG from 'seed-random';

import * as w from '../types';
import { DECK_SIZE } from '../constants';
import { triggerSound } from '../util/game';

import defaultState, { bluePlayerState, orangePlayerState } from './defaultGameState';

function deckHasNCards(deck: w.Deck, num: number): boolean {
  return deck.cards.length === num;
}

function deckHasOnlyBuiltinCards(deck: w.Deck): boolean {
  return deck.cards.every(card => card.source == 'builtin');
}

export class GameFormat {
  name: string | undefined = undefined;
  displayName: string | undefined = undefined;
  description: string | undefined = undefined;

  static fromString(gameFormatStr: String): GameFormat {
    const format = FORMATS.find(m => m.name === gameFormatStr);
    if (!format) {
      throw `Unknown game format: ${gameFormatStr}`;
    }
    return format;
  }

  isDeckValid = (_deck: w.Deck): boolean => false

  isActive(state: w.GameState): boolean {
    return state.gameFormat === this.name;
  }

  startGame(
    state: w.GameState, player: w.PlayerColor, usernames: w.PerPlayer<string>, _decks: w.PerPlayer<w.Card[]>, seed: string
  ): w.GameState {
    state = Object.assign(state, cloneDeep(defaultState), {
      gameFormat: this.name,
      player: player,
      rng: seededRNG(seed),
      started: true,
      usernames
    });
    state = triggerSound(state, 'yourmove.wav');

    return state;
  }
}

export const NormalGameFormat = new (class extends GameFormat {
  name = 'normal';
  displayName = 'Normal';
  description = 'Each player has a 30-card deck. No restrictions on cards.';

  isDeckValid = (deck: w.Deck): boolean => deckHasNCards(deck, DECK_SIZE);

  startGame(
    state: w.GameState, player: w.PlayerColor, usernames: w.PerPlayer<string>, decks: w.PerPlayer<w.Card[]>, seed: string
  ): w.GameState {
    state = super.startGame(state, player, usernames, decks, seed);

    state.players.blue = bluePlayerState(decks.blue);
    state.players.orange = orangePlayerState(decks.orange);

    return state;
  }
});

export const BuiltinOnlyGameFormat = new (class extends GameFormat {
  name = 'builtinOnly';
  displayName = 'Builtin Only';
  description = 'Normal game with only built-in cards allowed.';

  isDeckValid = (deck: w.Deck): boolean => (
    deckHasNCards(deck, DECK_SIZE) && deckHasOnlyBuiltinCards(deck)
  );

  startGame(
    state: w.GameState, player: w.PlayerColor, usernames: w.PerPlayer<string>, decks: w.PerPlayer<w.Card[]>, seed: string
  ): w.GameState {
    return NormalGameFormat.startGame(state, player, usernames, decks, seed);
  }
});

export const SharedDeckGameFormat = new (class extends GameFormat {
  name = 'sharedDeck';
  displayName = 'Shared Deck';
  description = 'Each player\'s 30-card deck is shuffled together into a shared 60-card deck. No restrictions on cards.';

  isDeckValid = (deck: w.Deck): boolean => deckHasNCards(deck, DECK_SIZE);

  startGame(
    state: w.GameState, player: w.PlayerColor, usernames: w.PerPlayer<string>, decks: w.PerPlayer<w.Card[]>, seed: string
  ): w.GameState {
    state = super.startGame(state, player, usernames, decks, seed);

    const deck = shuffle([...decks.blue, ...decks.orange]);
    // Give blue the top two cards, orange the next two (to form their starting hands),
    // and both players the rest of the deck.
    const [topTwo, nextTwo, restOfDeck] = [deck.slice(0, 2), deck.slice(2, 4), deck.slice(4)];

    state.players.blue = bluePlayerState([...topTwo, ...restOfDeck]);
    state.players.orange = orangePlayerState([...nextTwo, ...restOfDeck]);

    return state;
  }
});

export const FORMATS = [
  NormalGameFormat,
  BuiltinOnlyGameFormat,
  SharedDeckGameFormat
];
