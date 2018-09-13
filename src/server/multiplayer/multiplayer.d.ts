import * as WebSocket from 'ws';

import * as w from '../../common/types';

export type Action = w.Action;
export type ActionPayload = w.ActionPayload;
export type ActionType = w.ActionType;
export type Card = w.Card;
export type CardInGame = w.CardInGame;
export type CardInStore = w.CardInStore;
export type ObfuscatedCard = w.ObfuscatedCard;
export type Deck = w.Deck;
export type Format = w.Format;
export type GameState = w.GameState;
export type GameOptions = w.GameOptions;

export type ClientID = string;

export interface UserData {
  uid: string,
  displayName: string
  // Other fields are present in Firebase but we ignore them
}

export interface Game {
  id: ClientID,
  name: string,
  format: Format,
  type: string,
  players: ClientID[],
  playerColors: { [clientID: string]: w.PlayerColor; },
  ids: { blue: ClientID, orange: ClientID }, // TODO is this field necessary?
  spectators: ClientID[],
  actions: Action[],
  state: GameState,
  decks: { blue: ObfuscatedCard[], orange: ObfuscatedCard[] },
  usernames: { blue: string, orange: string },
  startingSeed: string,
  winner: w.PlayerColor | null,
  options: GameOptions
}

export interface GameWaitingForPlayers {
  id: string,
  name: string,
  format: Format,
  deck: Deck,
  players: ClientID[],
  options: GameOptions
}

export interface PlayerInQueue {
  clientID: ClientID,
  deck: Deck,
  format: Format
}

export interface ServerState {
  connections: { [clientID: string]: WebSocket; },
  games: Game[],
  gameObjects: { [gameID: string]: Game; }
  waitingPlayers: GameWaitingForPlayers[],
  matchmakingQueue: PlayerInQueue[]
  playersOnline: ClientID[],
  userData: { [clientID: string]: UserData | null; }
}

export interface SerializedServerState {
  games: Game[],
  waitingPlayers: GameWaitingForPlayers[],
  playersOnline: ClientID[],
  userData: { [clientID: string]: UserData | null; }
  queueSize: number
}
