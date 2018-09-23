import * as React from 'react';
import * as fb from 'firebase';

import * as m from '../server/multiplayer/multiplayer';

/* Simple types */

export type AbilityId = string;
export type Attribute = 'attack' | 'health' | 'speed';
export type CardId = string;
export type CardType = number;
export type Cause = string;
export type DeckId = string;
export type Format = 'normal' | 'builtinOnly' | 'sharedDeck';
export type HexId = string;
export type ParserMode = 'event' | 'object';
export type PlayerColor = 'blue' | 'orange';

export type Ability = PassiveAbility | TriggeredAbility | ActivatedAbility;
export type Card = CardInGame | CardInStore | ObfuscatedCard;
export type Targetable = CardInGame | _Object | HexId | PlayerInGameState;

export type PerPlayer<T> = Record<PlayerColor, T>;
export type StringRepresentationOf<T> = string;  // Not actually typechecked but can be useful documentation for stringified functions.

/* Library types */

export type ActionType = string;
export type ActionPayload = any;

export interface Action {
  type: ActionType,
  payload: ActionPayload
}

/* General types */

export interface Deck extends DeckInStore {
  cards: CardInStore[]
}

export interface DeckInStore {
  id: DeckId
  name: string
  cardIds: string[]
}

export interface CardInGame extends CardInStore {
  baseCost: number
  justPlayed?: boolean
  temporaryStatAdjustments?: {
    cost?: StatAdjustment[]
    attack?: StatAdjustment[]
    health?: StatAdjustment[]
    speed?: StatAdjustment[]
  }
}

export interface CardInStore {
  id: CardId
  name: string
  img?: string  // Only kernels have images
  spriteID?: string
  cost: number
  type: CardType
  stats?: {
    attack?: number
    health: number
    speed?: number
  }
  text?: string
  abilities?: string[]
  command?: StringRepresentationOf<(state: GameState) => any> | Array<StringRepresentationOf<(state: GameState) => any>>
  source?: string
  spriteV?: number
  parserV?: number | null
  timestamp?: number
}

export interface ObfuscatedCard {
  id: string
}

export interface Dictionary {
  definitions?: { [token: string]: any } // TODO more precise
  examplesByToken?: { [token: string]: string[] }
  examplesByNode?: { [token: string]: string[] }
}

export interface TutorialStep extends TutorialStepInScript {
  idx: number
  numSteps: number
}

export interface TutorialStepInScript {
  action?: Action | string
  highlight?: boolean
  responses?: Action[]
  tooltip: {
    backButton?: React.ReactElement<any>,
    card?: string
    hex?: HexId
    location?: string
    place?: string
    text: string
  }
}

export interface SavedGame { // Interface for games stored in Firebase.
  players: { [ color: string ]: any } // TODO more precise
  format: Format,
  type: string, // TODO more precise
  winner: PlayerColor | null
}

export interface Target {
  type: string
  entries: Targetable[]
}

export interface EventTarget {
  condition?: (trigger: Trigger) => boolean
  object?: _Object
  player?: boolean
  undergoer?: _Object
}

/* Redux store types */

export interface State {
  collection: CollectionState
  creator: CreatorState
  game: GameState
  global: GlobalState
  socket: SocketState,
  version: number
}

export interface CollectionState {
  cards: CardInStore[]
  decks: DeckInStore[]
  deckBeingEdited: DeckInStore | null
  exportedJson: string | null
  firebaseLoaded: boolean
}

export interface CreatorState {
  attack: number
  cost: number
  health: number
  id: string | null
  name: string
  parserVersion: number | null
  sentences: Sentence[]
  speed: number
  spriteID: string
  text: string
  type: CardType
}

export interface GameState {
  callbackAfterTargetSelected?: (state: GameState) => GameState
  currentTurn: PlayerColor,
  gameFormat: Format
  options: GameOptions
  player: PlayerColor,
  players: PerPlayer<PlayerInGameState>
  practice: boolean
  rng: () => number,
  sandbox: boolean
  started: boolean
  storeKey: 'game'
  tutorial: boolean
  tutorialCurrentStepIdx?: number
  tutorialSteps?: TutorialStepInScript[]
  usernames: PerPlayer<string>
  winner: PlayerColor | null
  [x: string]: any  // TODO Expose more field types as we need them
}

export interface GlobalState {
  dictionary?: Dictionary
  renderId: number
  user: fb.User | null
}

export interface SocketState {
  chatMessages: ChatMessage[]
  clientId: m.ClientID | null
  connected: boolean
  connecting: boolean
  gameName: string | null
  games: m.Game[]
  hosting: boolean
  inQueue: number
  playersOnline: m.ClientID[]
  queuing: boolean
  userDataByClientId: Record<m.ClientID, m.UserData>
  waitingPlayers: m.GameWaitingForPlayers[]
}

/* Game state subcomponents */

export interface GameOptions {
  disableTurnTimer?: boolean
  passwordToJoin?: string
}

export interface PlayerInGameState {
  deck: Array<CardInGame | ObfuscatedCard>
  discardPile: Array<CardInGame | ObfuscatedCard>
  energy: {
    available: number
    total: number
  }
  hand: Array<CardInGame | ObfuscatedCard>
  name: PlayerColor
  robotsOnBoard: {
    [hexId: string]: _Object
  }
  selectedCard: number | null
  selectedTile: HexId | null
  target: {
    choosing: boolean
    chosen: Targetable[] | null
    possibleCards: CardId[]
    possibleHexes: HexId[]
  }
  [x: string]: any  // TODO Expose more field types as we need them
}

// Object is not a valid type name, but we want to export `types.Object`,
// so define it with the name `_Object` here and export it as `Object`.
interface _Object { // tslint:disable-line:class-name
  id: string
  type: CardType,
  card: CardInGame,
  stats: {
    attack?: number
    health: number
    speed?: number
  }
  temporaryStatAdjustments?: {
    attack?: StatAdjustment[]
    health?: StatAdjustment[]
    speed?: StatAdjustment[]
  }
  movesMade: number
  triggers: TriggeredAbility[]
  abilities: PassiveAbility[]
  activatedAbilities?: ActivatedAbility[]
  effects?: Effect[]

  cantActivate?: boolean
  cantAttack?: boolean
  cantMove?: boolean
  attackedThisTurn?: boolean
  attackedLastTurn?: boolean
  movedThisTurn?: boolean
  movedLastTurn?: boolean
  beingDestroyed?: boolean
  isDestroyed?: boolean
  justPlayed?: boolean
}
export type Object = _Object;

export interface Robot extends _Object {
  type: 0
  attackedThisTurn: boolean
  attackedLastTurn: boolean
  movedThisTurn: boolean
  movedLastTurn: boolean
}

export interface StatAdjustment {
  func: StringRepresentationOf<(attr: number) => number>
}

export interface Effect {
  effect: string
  props: any
}

export interface ActivatedAbility {
  aid: AbilityId
  cmd: StringRepresentationOf<(state: GameState) => any>
  text: string
}

export interface PassiveAbility {
  aid: AbilityId
  apply: (target: Targetable) => Targetable
  currentTargets?: Target
  disabled?: boolean
  duration?: number
  targets: StringRepresentationOf<(state: GameState) => Target>
  unapply: (target: Targetable) => Targetable
}

export interface TriggeredAbility {
  action: (state: GameState) => any
  duration?: number
  object?: _Object
  trigger: Trigger
}

export interface Trigger {
  type: string
  targetFunc: (state: GameState) => Target[]
  targets?: Targetable[]

  cardType?: string
  cause?: Cause
  defenderType?: string
}

/* Creator state subcomponents */

export interface Sentence {
  sentence: string
  result: ParseResult
}

export interface ParseResult {
  error?: string
  js?: StringRepresentationOf<() => void>
  // TODO
}

/* Socket state subcomponents */

export interface ChatMessage {
  text: string
  timestamp: number
  user: string
}
