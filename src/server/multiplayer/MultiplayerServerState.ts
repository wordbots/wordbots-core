/* eslint-disable no-console */
import { compact, find, pull, reject } from 'lodash';

import { id as generateID } from '../../common/util/common';

import { getPeopleInGame, withoutClient } from './util';

export default class MultiplayerServerState {
  state = {
    connections: {},  // map of { clientID: websocket }
    games: [],  // array of { id, name, format, players, playerColors, spectators, actions, decks, usernames, startingSeed }
    waitingPlayers: [],  // array of { id, name, format, deck, players }
    playersOnline: [],  // array of clientIDs
    usernames: {}  // map of { clientID: username }
  };

  /* Getters */

  // Returns a serializable subset of the state for broadcast as an INFO message.
  serialize = () => {
    const { games, waitingPlayers, playersOnline, usernames } = this.state;
    return { games, waitingPlayers, playersOnline, usernames };
  }

  // Returns the socket corresponding to a given player.
  getClientSocket = (clientID) => (
    this.state.connections[clientID]
  )

  // Returns all websocket connections corresponding to the given clientIDs,
  // or ALL connections if no clientIDs are specified.
  getClientSockets = (clientIDs = null) => (
    clientIDs ? clientIDs.map(this.getClientSocket) : Object.values(this.state.connections)
  )

  // Returns the username to use for the given player.
  // If fallbackToClientID is true, falls back to the client ID if there is no
  // username set, otherwise returns null.
  getClientUsername = (clientID, fallbackToClientID = true) => (
    this.state.usernames[clientID] || (fallbackToClientID && clientID)
  )

  // Returns the game that the given player is in, if any.
  lookupGameByClient = (clientID) => (
    this.state.games.find(game => game.players.includes(clientID))
  )

  // Returns all *other* players in the game that the given player is in, if any.
  getAllOpponents = (clientID) => {
    const game = this.state.games.find(g => [...g.players, ...g.spectators].includes(clientID));
    return game ? getPeopleInGame(game).filter(id => id !== clientID) : [];
  }

  // Returns all *other* players currently in the lobby.
  getAllOtherPlayersInLobby = (clientID) => {
    const inGamePlayerIds = this.state.games.reduce((acc, game) => acc.concat(game.players), []);
    return this.state.playersOnline.filter(id => id !== clientID && !inGamePlayerIds.includes(id));
  }

  /* Mutations */

  // Connect a player at the specified websocket to the server.
  connectClient = (clientID, socket) => {
    this.state.connections[clientID] = socket;
    this.state.playersOnline.push(clientID);
    console.log(`${this.getClientUsername(clientID)} joined the room.`);
  }

  // Disconnect a player from the server.
  // Return the game that the player was in (if any).
  disconnectClient = (clientID) => {
    pull(this.state.playersOnline, clientID);
    this.state.waitingPlayers = reject(this.state.waitingPlayers, { id: clientID });

    const game = this.lookupGameByClient(clientID);
    if (game) {
      this.leaveGame(clientID);
    }

    delete this.state.connections[clientID];
    console.log(`${this.getClientUsername(clientID)} left the game.`);

    return game;
  }

  // Set a player's username.
  setClientUsername = (clientID, newUsername) => {
    this.state.usernames[clientID] = newUsername;
  }

  // Add an player action to the game that player is in.
  appendGameAction = (clientID, action) => {
    const game = this.state.games.find(g => g.players.includes(clientID));
    if (game) {
      game.actions.push(action);
    }
  }

  // Make a player host a game with the given name and using the given deck.
  hostGame = (clientID, name, format, deck) => {
    this.state.waitingPlayers.push({
      id: clientID,
      players: [clientID],
      name,
      format,
      deck
    });
    console.log(`${this.getClientUsername(clientID)} started game ${name}.`);
  }

  // Make a player join the given opponent's hosted game with the given deck.
  // Returns the game joined.
  joinGame = (clientID, opponentID, deck) => {
    const waitingPlayer = find(this.state.waitingPlayers, { id: opponentID });
    const game = {
      id: opponentID,
      name: waitingPlayer.name,
      format: waitingPlayer.format,

      players: [clientID, opponentID],
      playerColors: {[clientID]: 'blue', [opponentID]: 'orange'},
      spectators: [],

      actions: [],
      decks: {orange: waitingPlayer.deck, blue: deck},
      usernames: {
        orange: this.getClientUsername(opponentID),
        blue: this.getClientUsername(clientID)
      },
      startingSeed: generateID()
    };

    this.state.waitingPlayers = reject(this.state.waitingPlayers, { id: opponentID });
    this.state.games.push(game);

    console.log(`${this.getClientUsername(clientID)} joined game ${game.name} against ${this.getClientUsername(opponentID)}.`);
    return game;
  }

  // Make a player join the given game as a spectator.
  // Returns the game joined, or null if the game wasn't found.
  spectateGame = (clientID, gameID) => {
    const game = find(this.state.games, { id: gameID });
    if (game) {
      game.spectators.push(clientID);
      console.log(`${this.getClientUsername(clientID)} joined game ${game.name} as a spectator.`);
      return game;
    }
  }

  // Remove a player from any game that they are currently in.
  leaveGame = (clientID) => {
    this.state.games = compact(this.state.games.map(game => withoutClient(game, clientID)));
  }
}
