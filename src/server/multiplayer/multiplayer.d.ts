export type ClientID = string;

// TODO Figure these types out
export type Connection = any; // TODO websocket connection type
export type UserData = any;
export type Deck = any;
export type Action = any;
export type GameState = any;

export interface Game {
  id: ClientID,
  name: string,
  format: string,
  type: string,
  players: any[],
  playerColors: { [clientID: string]: string; },
  ids: { blue: ClientID, orange: ClientID }, // TODO is this field necessary?
  spectators: ClientID[],
  actions: Action[],
  state: GameState,
  decks: { blue: Deck, orange: Deck },
  usernames: { blue: string, orange: String },
  startingSeed: string
}

export interface WaitingPlayer {
  id: string,
  name: string,
  format: string,
  deck: Deck,
  players: any[]
}

export interface PlayerInQueue {
  clientID: ClientID,
  deck: Deck
}

interface ServerStateType {
  connections: { [clientID: string]: Connection; },
  games: Game[],
  gameObjects: { [gameID: string]: Game; }
  waitingPlayers: WaitingPlayer[],
  matchmakingQueue: PlayerInQueue[]
  playersOnline: ClientID[],
  userData: { [clientID: string]: any; }
}
