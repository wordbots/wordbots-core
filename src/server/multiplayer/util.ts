// Utility methods related to the multiplayer server go here.
import { AES, enc } from 'crypto-js';
import { without } from 'lodash';

import { id as generateID } from '../../common/util/common';

import * as m from './multiplayer';

const CARD_ENCRYPTION_KEY = generateID();

// Returns a copy of a game with the given client
// removed from both the players and spectators lists (if present),
// or null if this results in the game no longer having >=2 active players.
export function withoutClient(game: m.Game, clientID: m.ClientID): m.Game | null {
  const updatedGame = Object.assign({}, game, {
    players: without(game.players, clientID),
    spectators: without(game.spectators, clientID)
  });
  return updatedGame.players.length >= 2 ? updatedGame : null;
}

// Returns all people (players, spectators) connected to a game.
export function getPeopleInGame(game: m.Game): m.ClientID[] {
  return [...game.players, ...game.spectators];
}

export function encryptCard(card: m.CardInGame): m.EncryptedCardInDeck {
  return {
    id: AES.encrypt(JSON.stringify(card), CARD_ENCRYPTION_KEY).toString()
  };
}

export function decryptCard(card: m.EncryptedCardInDeck): m.CardInGame {
  return JSON.parse(AES.decrypt(card.id, CARD_ENCRYPTION_KEY).toString(enc.Utf8));
}
