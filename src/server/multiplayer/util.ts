// Utility methods related to the multiplayer server go here.
import { truncate, without } from 'lodash';

import * as m from './multiplayer';

const MAX_DEBUG_MSG_LENGTH = 500;

/** Truncate a string to MAX_DEBUG_MSG_LENGTH. */
export function renderMessage(msg: string): string {
  return truncate(msg, { length: MAX_DEBUG_MSG_LENGTH });
}

// Returns a copy of a game with the given client
// removed from both the players and spectators lists (if present),
// or null if this results in the game no longer having >=2 active players.
export function withoutClient(game: m.Game, clientID: m.ClientID): m.Game | null {
  const updatedGame = {
    ...game,
    players: without(game.players, clientID),
    spectators: without(game.spectators, clientID)
  };
  return updatedGame.players.length >= 2 ? updatedGame : null;
}

// Returns all people (players, spectators) connected to a game.
export function getPeopleInGame(game: m.Game): m.ClientID[] {
  return [...game.players, ...game.spectators];
}
