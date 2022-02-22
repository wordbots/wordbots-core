import { Server } from 'http';

import * as Flatted from 'flatted';
import { noop, truncate } from 'lodash';
import * as SafeJsonStringify from 'safe-json-stringify';
import * as WebSocket from 'ws';

import { ENABLE_OBFUSCATION_ON_SERVER } from '../../common/constants';
import { id as generateID } from '../../common/util/common';
import { opponent as opponentOf } from '../../common/util/game';

import * as m from './multiplayer';
import MultiplayerServerState from './MultiplayerServerState';
import { getPeopleInGame } from './util';

const MAX_DEBUG_MSG_LENGTH = 500;
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

  function onConnect(socket: WebSocket): void {
    const clientID = generateID();
    state.connectClient(clientID, socket);
    sendMessage('ws:CLIENT_ID', { clientID }, [clientID]);
    broadcastInfo();

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
      } catch (error) {
        console.error(error);
      }
    });
    socket.on('error', noop); // Probably a disconnect (throws an error in ws 3.3.3+).
  }

  function onMessage(clientID: m.ClientID, data: string): void {
    const { type, payload }: m.Action = Flatted.parse(data);

    if (type !== 'ws:KEEPALIVE') {
      console.log(`< ${truncate(data, {length: MAX_DEBUG_MSG_LENGTH})}`);
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
      const payloadWithSender = {...payload, sender: clientID};
      (inGame.length > 0 ? sendMessageInGame : sendMessageInLobby)(clientID, 'ws:CHAT', payloadWithSender);
    } else if (type !== 'ws:KEEPALIVE' && state.lookupGameByClient(clientID)) {
      // Broadcast in-game actions if the client is a player in a game.
      revealVisibleCardsInGame(state.lookupGameByClient(clientID)!, [{type, payload}, clientID]);
      state.appendGameAction(clientID, {type, payload});
      sendMessageInGame(clientID, type, payload);
      revealVisibleCardsInGame(state.lookupGameByClient(clientID)!);
    }
  }

  function onDisconnect(clientID: m.ClientID): void {
    const game = state.lookupGameByClient(clientID);
    if (game) {
      sendMessageInGame(clientID, 'ws:FORFEIT', {winner: opponentOf(game.playerColors[clientID])});
    }

    sendChat(`${state.getClientUsername(clientID)} has left.`);
    state.disconnectClient(clientID);
  }

  function sendMessage(type: string, payload: Record<string, any> = {}, recipientIDs: m.ClientID[] | null = null): void {
    const message = Flatted.stringify({type, payload});
    state.getClientSockets(recipientIDs).forEach((socket) => {
      try {
        socket.send(message);
        console.log(`> ${truncate(message, {length: MAX_DEBUG_MSG_LENGTH})}`);
      } catch (error) {
        console.warn(`Failed to send message ${truncate(message, {length: MAX_DEBUG_MSG_LENGTH})} to ${recipientIDs}: ${error.message}`);
      }
    });
  }

  function sendMessageInLobby(clientID: m.ClientID, type: string, payload: Record<string, unknown> = {}): void {
    console.log(`${clientID} broadcast a message to the lobby: ${type} ${SafeJsonStringify(payload)}`);
    sendMessage(type, payload, state.getAllOtherPlayersInLobby(clientID));
  }

  function sendMessageInGame(clientID: m.ClientID, type: string, payload: Record<string, unknown> = {}): void {
    const opponentIds = state.getAllOpponents(clientID);
    if (opponentIds.length > 0) {
      console.log(`${clientID} sent action to ${opponentIds}: ${type}, ${SafeJsonStringify(payload)}`);
      sendMessage(type, payload, opponentIds);
    }
  }

  function sendChat(msg: string, recipientIDs: m.ClientID[] | null = null): void {
    sendMessage('ws:CHAT', {msg, sender: '[Server]'}, recipientIDs);
  }

  function broadcastInfo(): void {
    sendMessage('ws:INFO', state.serialize());
  }

  function setUserData(clientID: m.ClientID, userData: m.UserData | null): void {
    const oldUserData = state.getClientUserData(clientID);
    state.setClientUserData(clientID, userData);
    if (!oldUserData && userData) {
      sendChat(`${userData.displayName} has entered the lobby.`);
    } else if (!state.isClientLoggedIn(clientID)) {
      sendChat(`${state.getClientUsername(clientID)} has entered the lobby.`);
    } else if (!userData && oldUserData) {
      sendChat(`${oldUserData.displayName} has logged out.`);
    }
    broadcastInfo();
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

      sendMessage('ws:GAME_START', {player: 'blue', format, decks, usernames, options, seed: startingSeed }, [clientID]);
      sendMessage('ws:GAME_START', {player: 'orange', format, decks, usernames, options, seed: startingSeed }, [opponentID]);
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
      sendMessage('ws:CURRENT_STATE', {actions}, [clientID]);
      sendChat(`Entering game ${name} as a spectator ...`, [clientID]);
      sendChat(`${state.getClientUsername(clientID)} has joined as a spectator.`, state.getAllOpponents(clientID));

      broadcastInfo();
    }
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

      sendMessage('ws:GAME_START', {player: 'blue', decks, usernames, seed: startingSeed }, [game.ids.blue]);
      sendMessage('ws:GAME_START', {player: 'orange', decks, usernames, seed: startingSeed }, [game.ids.orange]);
      sendChat(`Entering game ${name} ...`, game.players);

      broadcastInfo();
    });
  }
}
