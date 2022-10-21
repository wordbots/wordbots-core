import { chunk, compact, find, flatMap, fromPairs, groupBy, isNil, mapValues, pick, pull, reject, remove, without } from 'lodash';
import * as WebSocket from 'ws';

import { ENABLE_OBFUSCATION_ON_SERVER } from '../../common/constants';
import gameReducer from '../../common/reducers/game';
import defaultGameState from '../../common/store/defaultGameState';
import { instantiateCard, obfuscateCards } from '../../common/util/cards';
import { id as generateID } from '../../common/util/common';
import { saveGame } from '../../common/util/firebase';
import { GameFormat } from '../../common/util/formats';
import { opponent as opponentOf } from '../../common/util/game';
import { guestUID, guestUsername } from '../../common/util/multiplayer';

import * as m from './multiplayer';
import { getPeopleInGame, withoutClient } from './util';

/* eslint-disable no-console */
export default class MultiplayerServerState {
  private state: m.ServerState = {
    connections: {},
    gameObjects: {},
    games: [],
    matchmakingQueue: [],
    playersOnline: [],
    playersInSinglePlayerGames: [],
    userData: {},
    waitingPlayers: [],
  };

  /*
   * Getters
   */

  // Returns a serializable subset of the state for broadcast as an INFO message.
  public serialize = (): m.SerializedServerState => {
    const { games, waitingPlayers, playersOnline, userData, matchmakingQueue } = this.state;
    return {
      games,
      waitingPlayers,
      playersOnline,
      playersInLobby: this.getAllPlayersInLobby(),
      userData: fromPairs(Object.keys(userData).map((id) =>
        [id, pick(this.getClientUserData(id), ['uid', 'displayName'])]
      )),
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

  // Returns true iff the client is logged-in, that is, not a guest,
  // that is, has user data.
  public isClientLoggedIn = (clientID: m.ClientID): boolean => (
    !isNil(this.state.userData[clientID])
  )

  // Returns the user data for the given player.
  // If the player is a guest, returns something reasonable.
  public getClientUserData = (clientID: m.ClientID): m.UserData => (
    this.state.userData[clientID] || {
      uid: guestUID(clientID),
      displayName: guestUsername(clientID)
    }
  )

  // Returns the username to use for the given player.
  // If the player is a guest, return something reasonable.
  public getClientUsername = (clientID: m.ClientID): string => (
    this.getClientUserData(clientID).displayName
  )

  // Returns the game that the given player is in, if any.
  public lookupGameByClient = (clientID: m.ClientID): m.Game | undefined => (
    this.state.games.find((game) => getPeopleInGame(game).includes(clientID))
  )

  // Returns all *other* players in the game that the given player is in, if any.
  public getAllOpponents = (clientID: m.ClientID): m.ClientID[] => {
    const game = this.state.games.find((g) => [...g.players, ...g.spectators].includes(clientID));
    return game ? getPeopleInGame(game).filter((id) => id !== clientID) : [];
  }

  /** Returns whether the given player is currently known to be in a singleplayer game mode. */
  public isPlayerInSingleplayerGame = (clientID: m.ClientID): boolean => (
    this.state.playersInSinglePlayerGames.includes(clientID)
  )

  // Returns all players currently in the lobby.
  public getAllPlayersInLobby = (): m.ClientID[] => {
    const { games, playersOnline, playersInSinglePlayerGames } = this.state;
    const playersInMultiplayerGames: m.ClientID[] = games.flatMap(g => [...g.players, ...g.spectators]);
    return without(playersOnline, ...playersInMultiplayerGames, ...playersInSinglePlayerGames);
  }

  // Returns all *other* players currently in the lobby.
  public getAllOtherPlayersInLobby = (clientID: m.ClientID): m.ClientID[] => (
    this.getAllPlayersInLobby().filter((id) => id !== clientID)
  )

  // Returns all cards currently visible to a given client in a game.
  // If pendingAction is passed in, reveal any cards about to be played with the given client action.
  public getCardsToReveal = (clientID: m.ClientID, pendingAction?: [m.Action, m.ClientID]): { [playerColor: string]: { hand: m.Card[], discardPile: m.Card[] } } => {
    const game: m.Game = this.lookupGameByClient(clientID)!;
    const { players } = game.state;
    const playerColor: m.PlayerColor | null = game.playerColors[clientID] || null;

    // Is there a card about to be played that needs to be revealed?
    const cardPlayedIdx: { blue?: number, orange?: number } = {};
    if (pendingAction) {
      const [action, actionPerformerID] = pendingAction;
      const { type, payload } = action;
      const actionPerformerColor = game.playerColors[actionPerformerID];

      if (type === 'PLACE_CARD') {
        cardPlayedIdx[actionPerformerColor] = payload.cardIdx;
      } else if (players[actionPerformerColor].selectedCard !== null) {
        cardPlayedIdx[actionPerformerColor] = players[actionPerformerColor].selectedCard!;
      }
    }

    // Reveal cards to each player if:
    //   (1) the card is in the given player's hand, or
    //   (2) the card is in a discard pile, or
    //   (3) the card is about to be played
    return mapValues(players, (({ hand, discardPile }: m.PlayerInGameState, color: string) => {
      if (color !== playerColor) {
        hand = obfuscateCards(hand, cardPlayedIdx[color as m.PlayerColor]);
      }
      return { hand, discardPile };
    }));
  }

  /*
   * Mutations
   */

  // Connect a player at the specified websocket to the server.
  public connectClient = (clientID: m.ClientID, socket: WebSocket): void => {
    this.state.connections[clientID] = socket;
    this.state.playersOnline.push(clientID);
    console.log(`${this.getClientUsername(clientID)} joined the room.`);
  }

  // Disconnect a player from the server.
  public disconnectClient = (clientID: m.ClientID): void => {
    this.leaveGame(clientID);
    pull(this.state.playersOnline, clientID);
    this.state.waitingPlayers = reject(this.state.waitingPlayers, { id: clientID });
    delete this.state.connections[clientID];
    console.log(`${this.getClientUsername(clientID)} left the game.`);
  }

  // Set a player's username.
  public setClientUserData = (clientID: m.ClientID, userData: m.UserData | null): void => {
    this.state.userData[clientID] = userData;
  }

  /** Mark a given player as having entered a singleplayer game (thus leaving the lobby). */
  public enterSingleplayerGame = (clientID: m.ClientID): void => {
    this.state.playersInSinglePlayerGames = compact([...this.state.playersInSinglePlayerGames, clientID]);
  }

  /** Mark a given player as having exited a singleplayer game (thus entering the lobby). */
  public exitSingleplayerGame = (clientID: m.ClientID): void => {
    pull(this.state.playersInSinglePlayerGames, clientID);
  }

  // Add an player action to the game that player is in.
  // Also, updates the game state and checks if the game has been won.
  // Returns whether the game has ended.
  public appendGameAction = (clientID: m.ClientID, action: m.Action): { gameEnded: boolean } => {
    const game = this.state.games.find((g) => g.players.includes(clientID));
    if (game) {
      game.actions.push(action);
      game.state = gameReducer(game.state, action);
      if (game.state.winner) {
        this.endGame(game);
        return { gameEnded: true };
      }
    }

    return { gameEnded: false };
  }

  // Make a player host a game with the given name and using the given deck.
  public hostGame = (clientID: m.ClientID, name: string, format: m.Format, deck: m.Deck, options: m.GameOptions = {}): void => {
    const username = this.getClientUsername(clientID);
    const decodedFormat: GameFormat = GameFormat.decode(format);

    if (decodedFormat.requiresDeck && !decodedFormat.isDeckValid(deck)) {
      console.warn(`${username} tried to start game ${name} but their deck was invalid for the ${decodedFormat.name} format.`);
    } else {
      this.state.waitingPlayers.push({
        id: clientID,
        players: [clientID],
        name,
        format,
        deck,
        options
      });
      console.log(`${username} started game ${name}.`);
    }
  }

  // Cancel a game that is being hosted.
  public cancelHostingGame = (clientID: m.ClientID): void => {
    remove(this.state.waitingPlayers, ((w) => w.players.includes(clientID)));
  }

  // Make a player join the given opponent's hosted game with the given deck.
  // Returns the game joined (if any).
  public joinGame = (clientID: m.ClientID, opponentID: m.ClientID, deck: m.Deck, gameProps = {}): m.Game | undefined => {
    const waitingPlayer = find(this.state.waitingPlayers, { id: opponentID });
    const formatObj = waitingPlayer ? GameFormat.decode(waitingPlayer.format) : undefined;

    if (waitingPlayer && (!formatObj!.requiresDeck || formatObj!.isDeckValid(deck))) {
      const { name, format, options } = waitingPlayer;
      const decks = { orange: waitingPlayer.deck.cards.map(instantiateCard), blue: deck.cards.map(instantiateCard) };
      const usernames = { orange: this.getClientUsername(opponentID), blue: this.getClientUsername(clientID) };
      const seed = Math.random();

      const initialGameState: m.GameState = formatObj!.startGame(defaultGameState, 'orange', usernames, decks, options, seed);

      const game: m.Game = {
        id: generateID(),
        name,
        format,

        players: [clientID, opponentID],
        playerColors: { [clientID]: 'blue', [opponentID]: 'orange' },
        spectators: [],

        type: 'CASUAL',
        decks: ENABLE_OBFUSCATION_ON_SERVER ? { orange: obfuscateCards(decks.orange), blue: obfuscateCards(decks.blue) } : decks,
        usernames,
        ids: {
          blue: clientID,
          orange: opponentID
        },
        startingSeed: seed,
        winner: null,
        options,

        actions: [],
        state: initialGameState,

        ...gameProps
      };

      this.state.waitingPlayers = reject(this.state.waitingPlayers, { id: opponentID });
      this.state.games.push(game);

      console.log(`${this.getClientUsername(clientID)} joined game ${game.name} against ${this.getClientUsername(opponentID)}.`);
      return game;
    } else {
      console.warn(`${this.getClientUsername(clientID)} was unable to join ${this.getClientUsername(opponentID)}'s game.`);
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
    // Check if the client is a player (*not a spectator*) in a game
    const game = this.lookupGameByClient(clientID);
    if (game?.players.includes(clientID)) {
      const forfeitAction = { type: 'ws:FORFEIT' as const, payload: { winner: opponentOf(game.playerColors[clientID]) } };
      this.appendGameAction(clientID, forfeitAction);  // this will call state.endGame().
    }

    this.state.games = compact(this.state.games.map((g) => withoutClient(g, clientID)));
  }

  // Handle end-of-game actions.
  public endGame = (game: m.Game): void => {
    if (game.state.winner) {
      this.storeGameResult(game);

      // Remove the ended game from the game list.
      this.state.games = this.state.games.filter((g) => g.id !== game.id);

      // TODO Alter player ratings accordingly.
    }
  }

  // Store the result of a game in Firebase.
  public storeGameResult = (game: m.Game): void => {
    const { id, ids, format, type, state: { winner } } = game;
    saveGame({
      id,
      players: mapValues(ids, (clientID) =>
        this.getClientUserData(clientID) ? (this.getClientUserData(clientID) as m.UserData).uid : null
      ),
      format,
      type,
      winner,
      timestamp: Date.now()
    });
  }

  // Add a player to the matchmaking queue.
  public joinQueue = (clientID: m.ClientID, format: m.Format, deck: m.Deck): void => {
    if (this.isClientLoggedIn(clientID) && GameFormat.decode(format).isDeckValid(deck)) {
      this.state.matchmakingQueue.push({ clientID, format, deck });
    }
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
      const [playerId1, playerId2] = [player1.clientID, player2.clientID];
      const gameName = `${this.getClientUsername(playerId1)} vs ${this.getClientUsername(playerId2)}`;

      this.hostGame(playerId1, gameName, player1.format, player1.deck);
      const game = this.joinGame(playerId2, playerId1, player2.deck, { type: 'RANKED' });

      if (game) {
        this.state.matchmakingQueue = reject(matchmakingQueue, (p) => [playerId1, playerId2].includes(p.clientID));
        return game;
      }
    }));
  }
}
