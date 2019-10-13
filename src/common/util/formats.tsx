import { cloneDeep, groupBy, isString } from 'lodash';
import * as React from 'react';
import * as seededRNG from 'seed-random';
import { shuffle } from 'seed-shuffle';

import ProfileLink from '../components/users/ProfileLink';
import { DECK_SIZE } from '../constants';
import defaultState, { bluePlayerState, orangePlayerState } from '../store/defaultGameState';
import * as w from '../types';

import { triggerSound } from './game';

export function renderFormatDisplayName(format: w.Format): string {
  return GameFormat.decode(format).displayName!;
}

function deckHasNCards(deck: w.DeckInGame, num: number): boolean {
  return deck.cards.length === num;
}

function deckHasAtMostNCopiesPerCard(deck: w.DeckInGame, maxNum: number): boolean {
  const cardCounts: number[] = Object.values(groupBy(deck.cards, 'id'))
                                     .map((cards) => cards.length);
  return cardCounts.every((count) => count <= maxNum);
}

function deckHasOnlyBuiltinCards(deck: w.DeckInGame): boolean {
  return deck.cards.every((card) => card.metadata.source.type === 'builtin');
}

function deckBelongsToSet(deck: w.DeckInGame, set: w.Set): boolean {
  const cardIdsInSet: w.CardId[] = set.cards.map((c) => c.id);
  return deck.setId === set.id && deck.cardIds.every((id) => cardIdsInSet.includes(id));
}

export class GameFormat {
  public static decode(encodedFormat: w.Format): GameFormat {
    let format: GameFormat | undefined;
    if (isString(encodedFormat)) {
      format = BUILTIN_FORMATS.find((m) => m.name === encodedFormat);
    } else if (encodedFormat && encodedFormat._type === 'set') {
      format = new SetFormat((encodedFormat as w.SetFormat).set);
    }

    if (!format) {
      throw new Error(`Unknown game format: ${JSON.stringify(encodedFormat)}`);
    }
    return format;
  }

  public name: string | undefined;
  public displayName: string | undefined;
  public description: string | undefined;

  public serialized = (): w.Format => this.name as w.Format;

  public rendered = (): React.ReactNode => this.displayName;

  public isDeckValid = (_deck: w.DeckInGame): boolean => false;

  public isActive(state: w.GameState): boolean {
    return state.gameFormat === this.serialized();
  }

  public startGame(
    state: w.GameState, player: w.PlayerColor, usernames: w.PerPlayer<string>,
    _decks: w.PerPlayer<w.PossiblyObfuscatedCard[]>, options: w.GameOptions, seed: string
  ): w.GameState {
    state = {
      ...state,
      ...cloneDeep(defaultState),
      gameFormat: this.serialized(),
      player,
      rng: seededRNG(seed),
      started: true,
      usernames,
      options};
    state = triggerSound(state, 'yourmove.wav');

    return state;
  }
}

export const NormalGameFormat = new (class extends GameFormat {
  public name = 'normal';
  public displayName = 'Anything Goes';
  public description = 'Each player has a 30-card deck. No restrictions on cards.';

  public isDeckValid = (deck: w.DeckInGame): boolean => {
    return deckHasNCards(deck, DECK_SIZE);
  }

  public startGame(
    state: w.GameState, player: w.PlayerColor, usernames: w.PerPlayer<string>,
    decks: w.PerPlayer<w.PossiblyObfuscatedCard[]>, options: w.GameOptions, seed: string
  ): w.GameState {
    state = super.startGame(state, player, usernames, decks, options, seed);

    state.players.blue = bluePlayerState(decks.blue);
    state.players.orange = orangePlayerState(decks.orange);

    return state;
  }
});

export const BuiltinOnlyGameFormat = new (class extends GameFormat {
  public name = 'builtinOnly';
  public displayName = 'Builtins Only';
  public description = 'Normal game with only built-in cards allowed.';

  public isDeckValid = (deck: w.DeckInGame): boolean => (
    deckHasNCards(deck, DECK_SIZE) && deckHasOnlyBuiltinCards(deck)
  )

  public startGame(
    state: w.GameState, player: w.PlayerColor, usernames: w.PerPlayer<string>,
    decks: w.PerPlayer<w.PossiblyObfuscatedCard[]>, options: w.GameOptions, seed: string
  ): w.GameState {
    return NormalGameFormat.startGame(state, player, usernames, decks, options, seed);
  }
});

export const SharedDeckGameFormat = new (class extends GameFormat {
  public name = 'sharedDeck';
  public displayName = 'Shared Deck';
  public description = 'Each player\'s 30-card deck is shuffled together into a shared 60-card deck. No restrictions on cards.';

  public isDeckValid = (deck: w.DeckInGame): boolean => deckHasNCards(deck, DECK_SIZE);

  public startGame(
    state: w.GameState, player: w.PlayerColor, usernames: w.PerPlayer<string>,
    decks: w.PerPlayer<w.PossiblyObfuscatedCard[]>, options: w.GameOptions, seed: string
  ): w.GameState {
    state = super.startGame(state, player, usernames, decks, options, seed);

    const deck = shuffle([...decks.blue, ...decks.orange], seed);
    // Give blue the top two cards, orange the next two (to form their starting hands),
    // and both players the rest of the deck.
    const [topTwo, nextTwo, restOfDeck] = [deck.slice(0, 2), deck.slice(2, 4), deck.slice(4)];

    state.players.blue = bluePlayerState([...topTwo, ...restOfDeck]);
    state.players.orange = orangePlayerState([...nextTwo, ...restOfDeck]);

    return state;
  }
});

export class SetFormat extends GameFormat {
  public static description = 'Only cards from a given set are allowed, and no more than two per deck.';

  public name: string;
  public displayName: string;
  private set: w.Set;

  constructor(set: w.Set) {
    super();
    this.set = set;
    this.name = `set(${set.id})`;
    this.displayName = `Set: ${set.name} (by ${set.metadata.authorName})`;
  }

  public serialized = (): w.SetFormat => ({ _type: 'set', set: this.set });

  public rendered = (): React.ReactNode => (
    <div>
      <a
        href={`/sets?set=${this.set.id}`}
        style={{
          fontStyle: 'italic',
          textDecoration: 'underline',
          color: '#666'
        }}
        target="_blank"
        rel="noopener noreferrer"
      >
        {this.set.name}
      </a>
      {' '}set by{' '}
      <ProfileLink uid={this.set.metadata.authorId} username={this.set.metadata.authorName} />
    </div>
  )

  public isDeckValid = (deck: w.DeckInGame): boolean => (
    deckHasNCards(deck, 30)
      && deckBelongsToSet(deck, this.set)
      && deckHasAtMostNCopiesPerCard(deck, 2)
  )

  public startGame(
    state: w.GameState, player: w.PlayerColor, usernames: w.PerPlayer<string>,
    decks: w.PerPlayer<w.PossiblyObfuscatedCard[]>, options: w.GameOptions, seed: string
  ): w.GameState {
    return NormalGameFormat.startGame(state, player, usernames, decks, options, seed);
  }
}

export const BUILTIN_FORMATS = [
  NormalGameFormat,
  BuiltinOnlyGameFormat,
  SharedDeckGameFormat
];
