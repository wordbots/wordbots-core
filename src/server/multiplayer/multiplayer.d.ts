import * as WebSocket from 'ws';

import * as w from '../../common/types';

export type Action = w.Action;
export type ActionPayload = w.ActionPayload;
export type ActionType = w.ActionType;
export type Deck = w.Deck;
export type Format = w.Format;
export type GameState = w.GameState;

export type ClientID = string;

export interface UserData {
  uid: string,
  displayName: string
}

export interface Game {
  id: ClientID,
  name: string,
  format: Format,
  type: string,
  players: ClientID[],
  playerColors: { [clientID: string]: string; },
  ids: { blue: ClientID, orange: ClientID }, // TODO is this field necessary?
  spectators: ClientID[],
  actions: Action[],
  state: GameState,
  decks: { blue: Deck, orange: Deck },
  usernames: { blue: string, orange: string },
  startingSeed: string
}

export interface WaitingPlayer {
  id: string,
  name: string,
  format: Format,
  deck: Deck,
  players: ClientID[]
}

export interface PlayerInQueue {
  clientID: ClientID,
  deck: Deck,
  format: Format
}

interface ServerStateType {
  connections: { [clientID: string]: WebSocket; },
  games: Game[],
  gameObjects: { [gameID: string]: Game; }
  waitingPlayers: WaitingPlayer[],
  matchmakingQueue: PlayerInQueue[]
  playersOnline: ClientID[],
  userData: { [clientID: string]: UserData; }
}
