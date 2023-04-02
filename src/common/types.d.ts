import * as fb from 'firebase';
import * as React from 'react';
import * as ReactPopover from 'react-popover';

import * as m from '../server/multiplayer/multiplayer';

// Simple types

type timestamp = number;
type UserId = string;

export type AbilityId = string;
export type Attribute = 'attack' | 'health' | 'speed';
export type BuiltInFormat = 'normal' | 'builtinOnly' | 'sharedDeck';
export type CardId = string;
export type CardInSetRarity = 'common' | 'uncommon' | 'rare';
export type CardType = 0 | 1 | 2 | 3;
export type CardTypeQuery = 'robot' | 'action' | 'kernel' | 'structure' | 'allobjects' | 'anycard' | 'event';  // ('event' is deprecated name for 'action')
export type Cause = 'combat' | 'anyevent';
export type EffectType = 'canmoveoverobjects' | 'cannotactivate' | 'cannotattack' | 'cannotfightback' | 'cannotmove' | 'cannotmoveto' | 'canonlyattack';
export type DeckId = string;
export type GameWinner = PlayerColor | 'draw' | 'aborted' | null;  // (null indicates game is still in progress)
export type HexId = string;
export type ObjectId = string;
export type ParserMode = 'event' | 'object';
export type PlayerColor = 'blue' | 'orange';
export type SetId = string;
export type TextSource = 'load' | 'input' | 'didYouMean' | 'randomize';

export type Ability = PassiveAbility | TriggeredAbility | ActivatedAbility;
export type Card = CardInGame | CardInStore | ObfuscatedCard;
export type Format = BuiltInFormat | SetFormat | SetDraftFormat;
export type PossiblyObfuscatedCard = CardInGame | ObfuscatedCard;
export type Targetable = CardInGame | _Object | HexId | PlayerInGameState;

export type PerPlayer<T> = Record<PlayerColor, T>;
export type Returns<T> = (...args: any[]) => T;
export type StringRepresentationOf<_T> = string;  // Not actually typechecked but can be useful documentation for stringified functions.

// Library types

export type ActionType = string;
export type ActionPayload = any;

export interface Action<AT extends ActionType = ActionType> {
  type: AT
  payload?: ActionPayload
}

// Like Dispatch<AnyAction> but also supports intaking AnyAction[] for multipleDispatchMiddleware
export interface MultiDispatch {
  <T extends AnyAction | AnyAction[]>(action: T): T
}

/** Given actions/* module export T, produces the union type of action type strings (but not action implementations) exported by T. */
export type ActionTypeWithin<T> = Extract<T[keyof T], string>;

// General types

export interface DeckInGame extends DeckInStore {
  cards: CardInStore[]
}

export interface DeckInStore {
  id: DeckId
  authorId: UserId
  name: string
  cardIds: string[]
  timestamp?: timestamp  // timestamp of creation/modification
  lastUsedTimestamp?: timestamp  // timestamp of selection in a game
  setId: string | null
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
  highlightedTextBlocks?: string[]  // set when a card has been rewritten in-game by a rewrite effect
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
  flavorText?: string
  abilities?: string[]
  command?: StringRepresentationOf<(state: GameState) => unknown> | Array<StringRepresentationOf<(state: GameState) => unknown>>
  spriteV?: number
  parserV?: string | null
  metadata: CardMetadata
  // TODO what to do with the below properties when a card is edited? wipe them?
  originalParserV?: string  // the original parserV under which this card was created, if this card was migrated
  migrationBackup?: Array<{ parserV: string, abilities: string[] }>  // parsed JS for previous parser versions, if this card was migrated
}

export interface ObfuscatedCard {
  id: string
}

export interface CardMetadata {
  ownerId?: UserId  // should only be undefined if source.type === 'builtin'
  source: CardSource
  created?: timestamp
  updated?: timestamp
  isPrivate?: boolean
  importedFromJson?: timestamp  // undefined if the card wasn't imported from JSON, otherwise the timestamp that the import happened
  duplicatedFromCard?: {
    id: CardId
    name: string
    metadata: CardMetadata
  }
}

export interface CardSource {
  type: 'builtin' | 'user' | 'generated'  // For 'generated', see targets['generateCard']
  uid?: UserId
  username?: string
}

export interface Set {
  id: SetId
  name: string
  description?: string
  cards: Array<CardInStore & { rarity?: CardInSetRarity }>
  metadata: {
    authorId: UserId
    authorName: string
    isPublished: boolean
    lastModified: timestamp
  }
}

export interface SetFormat {
  _type: 'set'
  set: Set
}

export interface SetDraftFormat {
  _type: 'setDraft'
  set: Set
}

export interface Dictionary {
  definitions?: { [token: string]: Array<{ syntax: string, semantics: string }> }
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
    backButton?: React.ReactElement<unknown>
    card?: string
    hex?: HexId
    location?: string
    place?: ReactPopover.PopoverPlace
    text: string
  }
}

export interface SavedGame { // Interface for games stored in Firebase.
  id: string
  players: { [color: string]: m.ClientID | null }
  format: Format
  type: string // TODO more precise
  winner: GameWinner
  timestamp: timestamp
}

export interface EventTarget {
  condition?: (trigger: Trigger) => boolean
  object?: _Object
  player?: boolean
  undergoer?: _Object
}

export interface User {
  info?: fb.UserInfo
  achievements?: Record<string, boolean>
  statistics?: Record<string, number>
}

/** A bundle returned when an in-game re-parse (i.e. for a card rewrite effect) succeeds or fails. */
export interface InGameParseBundle {
  card: {
    id: CardId
    // We have to reference cards in hand by (color, name, text) tuples because cards' ids going to be inconsistent between the two players
    cardOwner: PlayerColor
    name: string
    oldText: string
  }
  newCardText: string
  highlightedTextBlocks: string[]
  parseResult: CardInStore | { error: string }
}

// Redux store types

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
}

export interface CreatorState {
  attack: number
  cost: number
  flavorText: string
  health: number
  id: string | null
  isPrivate?: boolean
  name: string
  parserVersion: string | null
  sentences: Sentence[]
  speed: number
  spriteID: string
  tempSavedVersion: CardInStore | null
  text: string
  textSource: w.TextSource
  type: CardType
  willCreateAnother: boolean
}

export interface GameState {
  actionLog: LoggedAction[]
  attack: Attack | null
  currentTurn: PlayerColor
  draft: DraftState | null
  eventQueue: CardInGame[]
  executionStackDepth: number
  gameFormat: Format
  memory: Record<string, unknown>
  objectsDestroyedThisTurn: Record<string, [HexId, PlayerColor]>  // object id -> (last hex id, player color)
  options: GameOptions
  player: PlayerColor | 'neither'
  players: PerPlayer<PlayerInGameState>
  practice: boolean
  rng: () => number
  sandbox: boolean
  sfxQueue: string[]
  started: boolean
  storeKey: 'game'
  tutorial: boolean
  usernames: PerPlayer<string>
  winner: GameWinner
  volume: number
  numParsesInFlight: number

  actionId?: string
  callbackAfterExecution?: (state: GameState) => GameState
  callbackAfterTargetSelected?: (state: GameState) => GameState
  currentCmdText?: string
  currentEntryInCollection?: Targetable
  disableDebugVerboseLogging?: boolean
  eventExecuting?: boolean
  invalid?: boolean
  it?: _Object | CardInGame
  itP?: PlayerInGameState
  that?: _Object
  tutorialActionsPerformed?: Array<Action | null>
  tutorialCurrentStepIdx?: number
  tutorialSteps?: TutorialStepInScript[]
}

export interface GlobalState {
  dictionary?: Dictionary
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
  playersOnline: m.ClientID[]
  playersInLobby: m.ClientID[]
  queuing: boolean
  queueSize: number
  userDataByClientId: Record<m.ClientID, m.UserData>
  waitingPlayers: m.GameWaitingForPlayers[]
}

// Game state subcomponents

export interface GameOptions {
  disableTurnTimer?: boolean
  passwordToJoin?: string
}

export interface PlayerInGameState {
  color: PlayerColor
  deck: PossiblyObfuscatedCard[]
  discardPile: CardInGame[]
  energy: PlayerEnergy
  hand: PossiblyObfuscatedCard[]
  objectsOnBoard: Record<string, _Object>
  selectedCard: number | null
  selectedTile: HexId | null
  status: PlayerStatus
  target: CurrentTarget
}

export interface PlayerEnergy {
  available: number
  total: number
}

export interface PlayerStatus {
  message: string
  type: 'text' | 'error' | ''
}

export interface CurrentTarget {
  choosing: boolean
  chosen: Array<CardInGame | HexId> | null
  possibleCardsInDiscardPile: CardId[]
  possibleCardsInHand: CardId[]
  possibleHexes: HexId[]
}

// Object is not a valid type name, but we want to export `types.Object`,
// so define it with the name `_Object` here and export it as `Object`.
interface _Object { // eslint-disable-line @typescript-eslint/naming-convention
  id: ObjectId
  type: CardType
  card: CardInGame
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
  effects: Effect[]

  cantActivate?: boolean
  cantAttack?: boolean
  cantMove?: boolean
  attackedThisTurn?: boolean
  attackedLastTurn?: boolean
  movedThisTurn?: boolean
  movedLastTurn?: boolean
  tookDamageThisTurn?: boolean
  beingDestroyed?: boolean
  isDestroyed?: boolean
  mostRecentlyInCombatWith?: ObjectId
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
  effect: EffectType
  props: unknown
}

export interface ActivatedAbility {
  aid: AbilityId
  cmd: StringRepresentationOf<(state: GameState) => unknown>
  text: string
}

export interface PassiveAbility {
  aid: AbilityId
  apply: (target: Targetable) => void
  currentTargets?: TargetReference
  disabled?: boolean
  duration?: number
  onlyExecuteOnce?: boolean
  source?: AbilityId
  targets: StringRepresentationOf<(state: GameState) => Target>
  text: string | null
  unapply: (target: Targetable) => void
}

export interface TriggeredAbility {
  action: ((state: GameState) => unknown) | StringRepresentationOf<(state: GameState) => unknown>
  duration?: number
  override?: boolean
  object?: _Object
  source?: AbilityId
  text: string | null
  trigger: Trigger
}

export interface Trigger {
  type: string
  targetFunc: ((state: GameState) => Target[]) | StringRepresentationOf<(state: GameState) => Target[]>
  targets?: TargetReference

  cardType?: CardTypeQuery | CardTypeQuery[]
  cause?: Cause
  attackerType?: string
  defenderType?: string
  damageSourceCardType?: string
}

export interface Attack {
  from: HexId
  to: HexId
  retract?: boolean
}

export interface LoggedAction extends ChatMessage {
  id: string
  user: string
  text: string
  timestamp: timestamp
  cards: Record<string, CardInGame>
}

export type DraftState = PerPlayer<{
  cardsDrafted: Array<CardInGame & { rarity?: CardInSetRarity }>
  cardGroupsToShow: Array<Array<CardInGame & { rarity?: CardInSetRarity }>>
}>;

// Creator state subcomponents

export interface Sentence {
  sentence: string
  result: ParseResult
}

export interface ParseResult {
  error?: string
  js?: StringRepresentationOf<() => void>
  unrecognizedTokens?: string[]
  suggestions?: string[]
  parsed?: boolean  // used by DictionaryDialog
}

// Socket state subcomponents

export interface ChatMessage {
  id?: string
  text: string
  timestamp: timestamp
  user: string
  cards?: Record<string, CardInGame>
}

// Vocabulary types

export type Collection = CardCollection | ObjectOrPlayerCollection | HexCollection;
export type Target = Collection;  // Easier to not have to maintain separate types for Target vs Collection since they're conceptually interchangeable.
export type CardCollection = CardInHandCollection | CardInDiscardPileCollection
export type ObjectOrPlayerCollection = ObjectCollection | PlayerCollection;
export interface CardInHandCollection {
  type: 'cards'
  entries: CardInGame[]
}
export interface CardInDiscardPileCollection {
  type: 'cardsInDiscardPile'
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

/** Internal types used to represent a reference that resolves to a `Target`. */
export type TargetReference = CardsTargetRef | ObjectsTargetRef | PlayersTargetRef | HexesTargetRef;
interface CardsTargetRef {
  type: 'cardIds'
  entries: CardId[]
}
interface ObjectsTargetRef {
  type: 'objectIds'
  entries: ObjectId[]
}
interface PlayersTargetRef {
  type: 'playerIds'
  entries: PlayerColor[]
}
type HexesTargetRef = HexCollection; // HexIds are just strings, so a HexCollection is its own reference.
