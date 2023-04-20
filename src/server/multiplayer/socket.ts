import { IncomingMessage, Server } from 'http';

import { noop } from 'lodash';
import * as WebSocket from 'ws';

import { DISCONNECT_FORFEIT_TIME_SECS, ENABLE_OBFUSCATION_ON_SERVER } from '../../common/constants';
import { id as generateID } from '../../common/util/common';

import * as m from './multiplayer';
import MultiplayerServerState from './MultiplayerServerState';
import { getPeopleInGame, truncateMessage } from './util';

const QUEUE_INTERVAL_MSECS = 500;

/* eslint-disable no-console */
export default function launchWebsocketServer(server: Server, path: string): void {
  const state = new MultiplayerServerState();

  const wss = new WebSocket.Server({
    path: '/socket',
    perMessageDeflate: false,
    server
  });

  wss.on('listening', onOpen);
  wss.on('connection', onConnect);

  function onOpen(): void {
    if (wss.options.server) {
      const { address, port } = wss.options.server.address() as { address: string, port: number };
      console.log(`WebSocket listening at http://${address}:${port}${path}`);

      setInterval(performMatchmaking, QUEUE_INTERVAL_MSECS);
    } else {
      console.error('WebSocket server failed to start');
    }
  }

  function onConnect(socket: WebSocket, req: IncomingMessage): void {
    const requestIp: string | undefined = (req.headers['x-forwarded-for'] as string | undefined) || req.connection.remoteAddress;
    const clientFingerprint = `${requestIp}::${Buffer.from(req.headers['user-agent'] || '').toString('base64')}`;
    const clientID = generateID(clientFingerprint);
    console.log(`Client connected: ${clientFingerprint} => ${clientID}`);

    state.connectClient(clientID, socket);
    sendMessage('ws:CLIENT_ID', { clientID }, [clientID]);
    broadcastInfo();

    const game = state.lookupGameByClient(clientID);
    if (game) {
      sendMessageInGame(clientID, 'ws:PLAYER_RECONNECTED', { player: game.playerColors[clientID] }, true);
      sendChatToGame(game, `${state.getClientUsername(clientID)} has rejoined the game.`);
    }

    socket.on('message', (msg: string) => {
      try {
        onMessage(clientID, msg);
      } catch (error) {
        console.error(error);
      }
    });
    socket.on('close', () => {
      try {
        onDisconnect(clientID);
        broadcastInfo();
      } catch (error) {
        console.error(error);
      }
    });
    socket.on('error', noop); // Probably a disconnect (throws an error in ws 3.3.3+).
  }

  function onMessage(clientID: m.ClientID, data: string): void {
    const { type, payload }: m.Action = JSON.parse(data);

    if (type !== 'ws:KEEPALIVE') {
      console.log(`${clientID}> ${truncateMessage(data)}`);
    }

    if (type === 'ws:HOST') {
      hostGame(clientID, payload.name, payload.format, payload.deck, payload.options);
    } else if (type === 'ws:CANCEL_HOSTING') {
      cancelHostingGame(clientID);
    } else if (type === 'ws:JOIN') {
      joinGame(clientID, payload.id, payload.deck);
    } else if (type === 'ws:JOIN_QUEUE') {
      joinQueue(clientID, payload.format, payload.deck);
    } else if (type === 'ws:LEAVE_QUEUE') {
      leaveQueue(clientID);
    } else if (type === 'ws:SPECTATE') {
      spectateGame(clientID, payload.id);
    } else if (type === 'ws:LEAVE') {
      leaveGame(clientID);
    } else if (type === 'ws:SEND_USER_DATA') {
      setUserData(clientID, payload.userData);
    } else if (type === 'ws:CHAT') {
      const inGame = state.getAllOpponents(clientID);
      const payloadWithSender = { ...payload, sender: clientID };
      (inGame.length > 0 ? sendMessageInGame : sendMessageInLobby)(clientID, 'ws:CHAT', payloadWithSender);
    } else if (['START_PRACTICE', 'START_TUTORIAL', 'START_SANDBOX'].includes(type)) {
      enterSingleplayerGame(clientID);
    } else if (type === 'END_GAME') {
      // We only track client-side END_GAME actions for singleplayer games - multiplayer games track their own end state.
      exitSingleplayerGame(clientID);
    } else if (type === 'ws:REJOIN_GAME') {
      const game = state.lookupGameByClient(clientID);
      if (game?.players.includes(clientID)) {
        rejoinGame(clientID, game);
      }
    } else if (type !== 'ws:KEEPALIVE' && state.lookupGameByClient(clientID)) {
      // Broadcast in-game actions if the client is a player in a game.
      revealVisibleCardsInGame(state.lookupGameByClient(clientID)!, [{ type, payload }, clientID]);
      sendMessageInGame(clientID, type, payload);
      const { gameEnded } = state.appendGameAction(clientID, { type, payload });
      revealVisibleCardsInGame(state.lookupGameByClient(clientID)!);

      // If the preceding in-game action has caused the game to end, broadcast the new lobby state
      // (i.e. remove the game from the active games list).
      if (gameEnded) {
        broadcastInfo();
      }
    }
  }

  function onDisconnect(clientID: m.ClientID): void {
    const username = state.getClientUsername(clientID);
    const game = state.lookupGameByClient(clientID);

    // check if the disconnecting client is a player (*not a spectator*) in  game
    if (game?.players.includes(clientID)) {
      sendMessageInGame(clientID, 'ws:PLAYER_DISCONNECTED', { player: game.playerColors[clientID] });
      setTimeout(() => {
        forfeitGameDueToDisconnection(clientID);
      }, DISCONNECT_FORFEIT_TIME_SECS * 1000);
    } else {
      sendChatToLobby(`${username} has left.`);
    }

    state.disconnectClient(clientID);
  }

  function forfeitGameDueToDisconnection(clientID: m.ClientID) {
    if (state.getClientSocket(clientID)) {
      // Client has rejoined the game - no need to forfeit
      return;
    }

    const forfeitMsgIfAny: m.MessageToSend | null = state.leaveGame(clientID);
    if (forfeitMsgIfAny) {
      const { type, payload, recipientIds } = forfeitMsgIfAny;
      sendMessage(type, payload, recipientIds);
    }
  }

  function sendMessage(type: string, payload: Record<string, unknown> = {}, recipientIDs: m.ClientID[] | null = null): void {
    const message = JSON.stringify({ type, payload });
    console.log(`${(recipientIDs?.length || 0) > 2 ? `(${recipientIDs!.length})` : recipientIDs?.join(',') || '&'}< ${truncateMessage(message)}`);
    state.getClientSockets(recipientIDs).forEach((socket) => {
      try {
        socket.send(message);
      } catch (error) {
        console.warn(`Failed to send message ${truncateMessage(message)} to ${recipientIDs}: ${error.message}`);
      }
    });
  }

  function sendMessageInLobby(clientID: m.ClientID, type: string, payload: Record<string, unknown> = {}): void {
    console.log(`${clientID} broadcast a message to the lobby: ${type} ${truncateMessage(JSON.stringify(payload))}`);
    sendMessage(type, payload, state.getAllOtherPlayersInLobby(clientID));
  }

  function sendMessageInGame(clientID: m.ClientID, type: string, payload: Record<string, unknown> = {}, allPeopleInGame = false): void {
    const recipientIds = allPeopleInGame ? getPeopleInGame(state.lookupGameByClient(clientID)!) : state.getAllOpponents(clientID);
    if (recipientIds.length > 0) {
      console.log(`${clientID} sent action to ${recipientIds}: ${type}, ${truncateMessage(JSON.stringify(payload))}`);
      sendMessage(type, payload, recipientIds);
    }
  }

  function sendChat(msg: string, recipientIDs: m.ClientID[] | null = null): void {
    sendMessage('ws:CHAT', { msg, sender: '[Server]' }, recipientIDs);
  }

  function sendChatToLobby(msg: string): void {
    sendMessage('ws:CHAT', { msg, sender: '[Server]' }, state.getAllPlayersInLobby());
  }

  function sendChatToGame(game: m.Game, msg: string): void {
    sendMessage('ws:CHAT', { msg, sender: '[Server]' }, getPeopleInGame(game));
  }

  function broadcastInfo(): void {
    sendMessage('ws:INFO', state.serialize() as unknown as Record<string, unknown>);
  }

  function setUserData(clientID: m.ClientID, userData: m.UserData | null): void {
    state.setClientUserData(clientID, userData);
    broadcastInfo();

    // The client has either entered the lobby or has rejoined their existing game (after temporarily disconnecting).
    if (!state.lookupGameByClient(clientID)) {
      sendChatToLobby(`${userData?.displayName || state.getClientUsername(clientID)} has entered the lobby.`);
    }
  }

  function hostGame(clientID: m.ClientID, name: string, format: m.Format, deck: m.Deck, options: m.GameOptions): void {
    state.hostGame(clientID, name, format, deck, options);
    broadcastInfo();
  }

  function cancelHostingGame(clientID: m.ClientID): void {
    state.cancelHostingGame(clientID);
    broadcastInfo();
  }

  function joinGame(clientID: m.ClientID, opponentID: m.ClientID, deck: m.Deck): void {
    const game = state.joinGame(clientID, opponentID, deck);
    if (game) {
      const { decks, format, name, startingSeed, usernames, options } = game;

      sendMessage('ws:GAME_START', { player: 'blue', format, decks, usernames, options, seed: startingSeed }, [clientID]);
      sendMessage('ws:GAME_START', { player: 'orange', format, decks, usernames, options, seed: startingSeed }, [opponentID]);
      revealVisibleCardsInGame(game);
      sendChat(`Entering game ${name} ...`, [clientID, opponentID]);
      broadcastInfo();
    }
  }

  function joinQueue(clientID: m.ClientID, format: m.Format, deck: m.Deck): void {
    state.joinQueue(clientID, format, deck);
    broadcastInfo();
  }

  function leaveQueue(clientID: m.ClientID): void {
    state.leaveQueue(clientID);
    broadcastInfo();
  }

  function enterSingleplayerGame(clientID: m.ClientID): void {
    state.enterSingleplayerGame(clientID);
    sendChatToLobby(`${state.getClientUsername(clientID)} has left the lobby to play a singleplayer game mode.`);
    broadcastInfo();
  }

  function exitSingleplayerGame(clientID: m.ClientID): void {
    if (state.isPlayerInSingleplayerGame(clientID)) {
      state.exitSingleplayerGame(clientID);
      sendChatToLobby(`${state.getClientUsername(clientID)} has rejoined the lobby.`);
    }
    broadcastInfo();
  }

  function spectateGame(clientID: m.ClientID, gameID: m.ClientID): void {
    const game: m.Game | undefined = state.spectateGame(clientID, gameID);
    if (game) {
      const { actions, decks, format, name, startingSeed, usernames } = game;

      const gameStartPayload = {
        player: 'neither',
        decks,
        usernames,
        format,
        seed: startingSeed
      };

      sendMessage('ws:GAME_START', gameStartPayload, [clientID]);
      sendMessage('ws:CURRENT_STATE', { actions }, [clientID]);
      sendChat(`Entering game ${name} as a spectator ...`, [clientID]);
      sendChat(`${state.getClientUsername(clientID)} has joined as a spectator.`, state.getAllOpponents(clientID));

      broadcastInfo();
    }
  }

  function rejoinGame(clientID: m.ClientID, game: m.Game): void {
    const { actions, decks, format, name, playerColors, startingSeed, usernames } = game;

    const gameStartPayload = {
      player: playerColors[clientID],
      decks,
      usernames,
      format,
      seed: startingSeed
    };

    sendMessage('ws:GAME_START', gameStartPayload, [clientID]);
    sendMessage('ws:CURRENT_STATE', { actions }, [clientID]);
    sendChat(`Rejoining game ${name} ...`, [clientID]);

    broadcastInfo();
  }

  function revealVisibleCardsInGame(game: m.Game, pendingAction?: [m.Action, m.ClientID]): void {
    if (ENABLE_OBFUSCATION_ON_SERVER) {
      getPeopleInGame(game).forEach((clientID: m.ClientID) => {
        sendMessage('ws:REVEAL_CARDS', state.getCardsToReveal(clientID, pendingAction), [clientID]);
      });
    }
  }

  function leaveGame(clientID: m.ClientID): void {
    state.leaveGame(clientID);
    sendChat('Entering the lobby ...', [clientID]);
    broadcastInfo();
  }

  function performMatchmaking(): void {
    const newGames = state.matchPlayersIfPossible();
    newGames.forEach((game) => {
      const { decks, name, startingSeed, usernames } = game;

      sendMessage('ws:GAME_START', { player: 'blue', decks, usernames, seed: startingSeed }, [game.ids.blue]);
      sendMessage('ws:GAME_START', { player: 'orange', decks, usernames, seed: startingSeed }, [game.ids.orange]);
      sendChat(`Entering game ${name} ...`, game.players);

      broadcastInfo();
    });
  }
}
