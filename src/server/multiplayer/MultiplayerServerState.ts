/* eslint-disable no-console */
import * as WebSocket from 'ws';
import { chunk, compact, find, flatMap, groupBy, mapValues, pull, reject } from 'lodash';

import { id as generateID } from '../../common/util/common.ts';
import { saveGame } from '../../common/util/firebase.ts';
import defaultGameState from '../../common/store/defaultGameState';
import { GameFormat } from '../../common/store/gameFormats';
import gameReducer from '../../common/reducers/game';

import * as m from './multiplayer';
import { getPeopleInGame, withoutClient } from './util';

/* tslint:disable:no-console */
export default class MultiplayerServerState {
  private state: m.ServerStateType = {
    connections: {},  // map of { clientID: websocket }
    gameObjects: {}, // map of { gameID: game }
    games: [],  // array of { id, name, format, players, playerColors, spectators, actions, decks, usernames, startingSeed }
    matchmakingQueue: [], // array of { clientID, deck }
    playersOnline: [],  // array of clientIDs
    userData: {}, // map of { clientID: { uid, displayName, ... } }
    waitingPlayers: [],  // array of { id, name, format, deck, players }
  };

  /* Getters */

  // Returns a serializable subset of the state for broadcast as an INFO message.
  public serialize = () => {
    const { games, waitingPlayers, playersOnline, userData, matchmakingQueue } = this.state;
    return {
      games,
      waitingPlayers,
      playersOnline,
      usernames: mapValues(userData, 'displayName'),
      queueSize: matchmakingQueue.length
    };
  }

  // Returns the socket corresponding to a given player.
  public getClientSocket = (clientID: m.ClientID): WebSocket => (
    this.state.connections[clientID]
  )

  // Returns all websocket connections corresponding to the given clientIDs,
  // or ALL connections if no clientIDs are specified.
  public getClientSockets = (clientIDs: m.ClientID[] | null = null): WebSocket[] => (
    clientIDs ? clientIDs.map(this.getClientSocket) : Object.values(this.state.connections)
  )

  // Returns the user data for the given player, if it exists.
  public getClientUserData = (clientID: m.ClientID): m.UserData => (
    this.state.userData[clientID]
  )

  // Returns the username to use for the given player,
  // or falls back to the client ID if there is no username set.
  public getClientUsername = (clientID: m.ClientID): string => (
    this.getClientUserData(clientID)
      ? this.getClientUserData(clientID).displayName
      : clientID
  )

  // Returns the game that the given player is in, if any.
  public lookupGameByClient = (clientID: m.ClientID): m.Game | undefined => (
    this.state.games.find((game) => game.players.includes(clientID))
  )

  // Returns all *other* players in the game that the given player is in, if any.
  public getAllOpponents = (clientID: m.ClientID): m.ClientID[] => {
    const game = this.state.games.find((g) => [...g.players, ...g.spectators].includes(clientID));
    return game ? getPeopleInGame(game).filter((id) => id !== clientID) : [];
  }

  // Returns all *other* players currently in the lobby.
  public getAllOtherPlayersInLobby = (clientID: m.ClientID): m.ClientID[] => {
    const inGamePlayerIds = this.state.games.reduce((acc: m.ClientID[], game: m.Game) => (
      acc.concat(game.players)
    ), []);
    return this.state.playersOnline.filter((id) => id !== clientID && !inGamePlayerIds.includes(id));
  }

  /* Mutations */

  // Connect a player at the specified websocket to the server.
  public connectClient = (clientID: m.ClientID, socket: WebSocket): void => {
    this.state.connections[clientID] = socket;
    this.state.playersOnline.push(clientID);
    console.log(`${this.getClientUsername(clientID)} joined the room.`);
  }

  // Disconnect a player from the server.
  // Return the game that the player was in (if any).
  public disconnectClient = (clientID: m.ClientID): m.Game | undefined => {
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
  public setClientUserData = (clientID: m.ClientID, userData: m.UserData): void => {
    this.state.userData[clientID] = userData;
  }

  // Add an player action to the game that player is in.
  // Also, updates the game state and checks if the game has been won.
  public appendGameAction = (clientID: m.ClientID, action: m.Action): void => {
    const game = this.state.games.find((g) => g.players.includes(clientID));
    if (game) {
      game.actions.push(action);
      game.state = gameReducer(game.state, action);
      if (game.state.winner) {
        this.endGame(game);
      }
    }
  }

  // Make a player host a game with the given name and using the given deck.
  public hostGame = (clientID: m.ClientID, name: string, format: m.Format, deck: m.Deck): void => {
    const username = this.getClientUsername(clientID);

    if (GameFormat.fromString(format).isDeckValid(deck)) {
      this.state.waitingPlayers.push({
        id: clientID,
        players: [clientID],
        name,
        format,
        deck
      });
      console.log(`${username} started game ${name}.`);
    } else {
      console.warn(`${username} tried to start game ${name} but their deck was invalid for the ${format} format.`);
    }
  }

  // Make a player join the given opponent's hosted game with the given deck.
  // Returns the game joined (if any).
  public joinGame = (clientID: m.ClientID, opponentID: m.ClientID, deck: m.Deck, gameProps = {}): m.Game | undefined => {
    const waitingPlayer = find(this.state.waitingPlayers, { id: opponentID });
    const gameId = generateID();

    if (waitingPlayer && GameFormat.fromString(waitingPlayer.format).isDeckValid(deck)) {
      const game: m.Game = {
        id: gameId,
        name: `Casual#${waitingPlayer.name}`,
        format: waitingPlayer.format,

        players: [clientID, opponentID],
        playerColors: {[clientID]: 'blue', [opponentID]: 'orange'},
        spectators: [],

        type: 'CASUAL',
        decks: {orange: waitingPlayer.deck, blue: deck},
        usernames: {
          orange: this.getClientUsername(opponentID),
          blue: this.getClientUsername(clientID)
        },
        ids : {
          blue: clientID,
          orange: opponentID
        },
        startingSeed: generateID(),
        winner: null,

        actions: [],
        state: defaultGameState,

        ...gameProps
      };

      this.state.waitingPlayers = reject(this.state.waitingPlayers, { id: opponentID });
      this.state.games.push(game);

      console.log(`${this.getClientUsername(clientID)} joined game ${game.name} against ${this.getClientUsername(opponentID)}.`);
      return game;
    } else {
      console.warn(`${this.getClientUsername(clientID)} was unable to join ${this.getClientUsername(opponentID)}'s game'.`);
    }
  }

  // Make a player join the given game as a spectator.
  // Returns the game joined, or undefined if the game wasn't found.
  public spectateGame = (clientID: m.ClientID, gameID: string): m.Game | undefined => {
    const game = find(this.state.games, { id: gameID });
    if (game) {
      game.spectators.push(clientID);
      console.log(`${this.getClientUsername(clientID)} joined game ${game.name} as a spectator.`);
      return game;
    }
  }

  // Remove a player from any game that they are currently in.
  public leaveGame = (clientID: m.ClientID): void => {
    this.state.games = compact(this.state.games.map((game) => withoutClient(game, clientID)));
  }

  // Handle end-of-game actions.
  public endGame = (game: m.Game): void => {
    if (game.state.winner) {
      this.storeGameResult(game);
      // TODO Alter player ratings accordingly.
    }
  }

  // Store the result of a game in Firebase.
  public storeGameResult = (game: m.Game): void => {
    const { ids, format, type, state: { winner } } = game;
    saveGame({
      players: mapValues(ids, (clientID) => this.getClientUserData(clientID).uid),
      format,
      type,
      winner
    });
  }

  // Add a player to the matchmaking queue.
  public joinQueue = (clientID: m.ClientID, format: m.Format, deck: m.Deck): void => {
    this.state.matchmakingQueue.push({ clientID, format, deck });
  }

  // Remove a player from the matchmaking queue.
  public leaveQueue = (clientID: m.ClientID): void => {
    this.state.matchmakingQueue = reject(this.state.matchmakingQueue, { clientID });
  }

  // Return pairs of queued players to match into games.
  // TODO: Fix this, using MMR.
  public findAvailableMatches = (): m.PlayerInQueue[][] => {
    const { matchmakingQueue } = this.state;
    const queuesPerFormat: m.PlayerInQueue[][] = Object.values(groupBy(matchmakingQueue, 'format'));

    return flatMap(queuesPerFormat, (queue) => chunk(queue, 2).filter((p) => p.length === 2));
  }

  // Pair players if there are at least two people waiting for a ranked game.
  // Return all games created.
  public matchPlayersIfPossible = (): m.Game[] => {
    const { matchmakingQueue } = this.state;
    const playerPairs = this.findAvailableMatches();

    return compact(playerPairs.map(([player1, player2]) => {
      const [ playerId1, playerId2 ] = [ player1.clientID, player2.clientID ];
      const gameName = `Ranked#${this.getClientUsername(playerId1)}-vs-${this.getClientUsername(playerId2)}`;

      this.hostGame(playerId1, gameName, 'normal', player1.deck);
      const game = this.joinGame(playerId2, playerId1, player2.deck, { type: 'RANKED' });

      if (game) {
        this.state.matchmakingQueue = reject(matchmakingQueue, (p) => [playerId1, playerId2].includes(p.clientID));
        this.state.games.push(game);
        return game;
      }
    }));
  }
}
