import * as React from 'react';
import * as fb from 'firebase';
import * as fjp from 'fast-json-patch';

import * as m from '../server/multiplayer/multiplayer';

/* Simple types */

export type AbilityId = string;
export type Attribute = 'attack' | 'health' | 'speed';
export type CardId = string;
export type CardType = 0 | 1 | 2 | 3;
export type Cause = string;
export type DeckId = string;
export type Format = 'normal' | 'builtinOnly' | 'sharedDeck';
export type HexId = string;
export type ParserMode = 'event' | 'object';
export type PlayerColor = 'blue' | 'orange';

export type Ability = PassiveAbility | TriggeredAbility | ActivatedAbility;
export type Card = CardInGame | CardInStore | ObfuscatedCard;
export type PossiblyObfuscatedCard = CardInGame | ObfuscatedCard;
export type Targetable = CardInGame | _Object | HexId | PlayerInGameState;

export type PerPlayer<T> = Record<PlayerColor, T>;
export type Returns<T> = (...args: any[]) => T;
export type StringRepresentationOf<T> = string;  // Not actually typechecked but can be useful documentation for stringified functions.

/* Library types */

export type ActionType = string;
export type ActionPayload = any;

export interface Action {
  type: ActionType,
  payload?: ActionPayload
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

export interface Set {
  id: string
  name: string
  description?: string
  cards: CardInStore[]
  metadata: {
    authorId: string
    authorName: string
    isPublished: boolean
    lastModified: number  // timestamp
    numDecksCreated?: number
  }
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
  id: string,
  players: { [ color: string ]: any } // TODO more precise
  format: Format,
  type: string, // TODO more precise
  winner: PlayerColor | null,
  timestamp: number
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
  socket: SocketState
  version: string
}

export interface CollectionState {
  cards: CardInStore[]
  decks: DeckInStore[]
  sets: Set[]
  deckBeingEdited: DeckInStore | null
  setBeingEdited: Set | null
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
  actionLog: LoggedAction[]
  attack: Attack | null
  currentTurn: PlayerColor,
  eventQueue: CardInGame[]
  gameFormat: Format
  memory: Record<string, any>
  options: GameOptions
  player: PlayerColor,
  players: PerPlayer<PlayerInGameState>
  practice: boolean
  rng: () => number,
  sandbox: boolean
  sfxQueue: string[]
  started: boolean
  storeKey: 'game'
  tutorial: boolean
  usernames: PerPlayer<string>
  winner: PlayerColor | null

  actionId?: string
  callbackAfterTargetSelected?: (state: GameState) => GameState
  currentCmdText?: string
  currentObjectInCollection?: Targetable
  eventExecuting?: boolean
  invalid?: boolean
  it?: _Object | CardInGame
  itP?: PlayerInGameState
  that?: _Object
  tutorialCurrentStepIdx?: number
  tutorialSteps?: TutorialStepInScript[]
  undoStack?: fjp.Operation[][]
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
  collection: PossiblyObfuscatedCard[]
  deck: PossiblyObfuscatedCard[]
  discardPile: PossiblyObfuscatedCard[]
  energy: {
    available: number
    total: number
  }
  hand: PossiblyObfuscatedCard[]
  name: PlayerColor
  robotsOnBoard: {
    [hexId: string]: _Object
  }
  selectedCard: number | null
  selectedTile: HexId | null
  status: {
    message: string
    type: 'text' | 'error' | ''
  }
  target: {
    choosing: boolean
    chosen: Array<CardInGame | HexId> | null
    possibleCards: CardId[]
    possibleHexes: HexId[]
  }
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
    cost?: StatAdjustment[]  // cost is not really needed here, but kept to match CardInGame.temporaryStatAdjustments
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
  aid?: AbilityId
  func: StringRepresentationOf<(attr: number) => number>
}

export interface Effect {
  aid: AbilityId
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
  source?: AbilityId
  targets: StringRepresentationOf<(state: GameState) => Target>
  unapply: (target: Targetable) => Targetable
}

export interface TriggeredAbility {
  action: (state: GameState) => any
  duration?: number
  object?: _Object
  source?: AbilityId
  trigger: Trigger
}

export interface Trigger {
  type: string
  targetFunc: ((state: GameState) => Target[]) | StringRepresentationOf<(state: GameState) => Target[]>
  targets?: Targetable[]

  cardType?: string
  cause?: Cause
  defenderType?: string
}

export interface Attack {
  from: HexId
  to: HexId
}

export interface LoggedAction {
  id: string
  user: string
  text: string
  timestamp: number
  cards: Record<string, CardInGame>
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

/* Vocabulary types */

export type Collection = CardCollection | ObjectOrPlayerCollection | HexCollection;
export type Target = Collection;
export type ObjectOrPlayerCollection = ObjectCollection | PlayerCollection;
export interface CardCollection {
  type: 'cards'
  entries: CardInGame[]
}
export interface ObjectCollection {
  type: 'objects'
  entries: _Object[]
}
export interface PlayerCollection {
  type: 'players'
  entries: PlayerInGameState[]
}
export interface HexCollection {
  type: 'hexes'
  entries: HexId[]
}
