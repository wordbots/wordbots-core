export type PlayerColor = 'blue' | 'orange';
export type Format = 'normal' | 'builtinOnly' | 'sharedDeck';

export type PerPlayer<T> = {
  [P in PlayerColor]: T
}

export interface Deck {
  cards: Card[]
}

export interface Card {
  source: string
  [x: string]: any  // TODO Expose more field types as we need them
}

export interface GameState {
  currentTurn: PlayerColor,
  gameFormat: Format
  player: PlayerColor,
  players: PerPlayer<PlayerState>
  practice: boolean
  rng: () => number,
  sandbox: boolean
  started: boolean
  storeKey: 'game'
  tutorial: boolean
  usernames: PerPlayer<string> | {}
  winner: PlayerColor | null
  [x: string]: any  // TODO Expose more field types as we need them
}

export interface PlayerState {
  // TODO Expose more field types as we need them
  [x: string]: any  // TODO Expose more field types as we need them
}
