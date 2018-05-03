import { cloneDeep, shuffle } from 'lodash';
import seededRNG from 'seed-random';

import { triggerSound } from '../util/game';

import defaultState, { bluePlayerState, orangePlayerState } from './defaultGameState';

export class GameMode {
  name = undefined;

  static fromString(gameModeStr) {
    const modes = [ NormalGameMode, SharedDeckGameMode ];
    const mode = modes.find(m => m.name === gameModeStr);
    if (!mode) {
      throw `Unknown game mode: ${gameModeStr}`;
    }
    return mode;
  }

  isActive(state) {
    return state.gameMode === this.name;
  }

  startGame(state, player, usernames, decks, seed) {
    state = Object.assign(state, cloneDeep(defaultState), {
      gameMode: this.name,
      player: player,
      rng: seededRNG(seed),
      started: true,
      usernames
    });
    state = triggerSound(state, 'yourmove.wav');

    return state;
  }
}

export const NormalGameMode = new (class extends GameMode {
  name = 'normal';

  startGame(state, player, usernames, decks, seed) {
    state = super.startGame(state, player, usernames, decks, seed);

    state.players.blue = bluePlayerState(decks.blue);
    state.players.orange = orangePlayerState(decks.orange);

    return state;
  }
});

export const SharedDeckGameMode = new (class extends GameMode {
  name = 'sharedDeck';

  startGame(state, player, usernames, decks, seed) {
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
