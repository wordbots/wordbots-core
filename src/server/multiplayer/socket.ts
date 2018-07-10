import * as WebSocket from 'ws';
import { Server } from 'http';
import { noop } from 'lodash';

import { id as generateID } from '../../common/util/common.ts';
import { opponent as opponentOf } from '../../common/util/game.ts';

import * as m from './multiplayer';
import MultiplayerServerState from './MultiplayerServerState';

const QUEUE_INTERVAL_MSECS = 500;

/* tslint:disable:no-console */
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
      const { address, port } = wss.options.server.address();
      console.log(`WebSocket listening at http://${address}:${port}${path}`);

      setInterval(performMatchmaking, QUEUE_INTERVAL_MSECS);
    } else {
      console.error("WebSocket server failed to start");
    }
  }

  function onConnect(socket: WebSocket): void {
    const clientID = generateID();
    state.connectClient(clientID, socket);
    broadcastInfo();

    socket.on('message', (msg: string) => {
      try {
        onMessage(clientID, msg);
      } catch (ex) {
        console.error(ex);
      }
    });
    socket.on('close', () => {
      try {
        onDisconnect(clientID);
      } catch (ex) {
        console.error(ex);
      }
    });
    socket.on('error', noop); // Probably a disconnect (throws an error in ws 3.3.3+).
  }

  function onMessage(clientID: m.ClientID, data: string): void {
    const { type, payload }: m.Action = JSON.parse(data);

    if (type !== 'ws:KEEPALIVE') {
      console.log(`< ${data}`);
    }

    if (type === 'ws:HOST') {
      hostGame(clientID, payload.name, payload.format, payload.deck);
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
      const payloadWithSender = Object.assign({}, payload, {sender: clientID});
      (inGame ? sendMessageInGame : sendMessageInLobby)(clientID, 'ws:CHAT', payloadWithSender);
    } else if (type !== 'ws:KEEPALIVE' && state.lookupGameByClient(clientID)) {
      // Broadcast in-game actions if the client is a player in a game.
      state.appendGameAction(clientID, {type, payload});
      sendMessageInGame(clientID, type, payload);
    }
  }

  function onDisconnect(clientID: m.ClientID): void {
    const game = state.disconnectClient(clientID);
    sendChat(`${state.getClientUsername(clientID)} has left.`);
    if (game) {
      sendMessageInGame(clientID, 'ws:FORFEIT', {winner: opponentOf(game.playerColors[clientID])});
    }
  }

  function sendMessage(type: string, payload: object = {}, recipientIDs: m.ClientID[] | null = null): void {
    const message = JSON.stringify({type, payload});
    state.getClientSockets(recipientIDs).forEach((socket) => {
      try {
        socket.send(message);
        console.log(`> ${message}`);
      } catch (err) {
        console.warn(`Failed to send message ${message} to ${recipientIDs}: ${err.message}`);
      }
    });
  }

  function sendMessageInLobby(clientID: m.ClientID, type: string, payload: object = {}): void {
    console.log(`${clientID} broadcast a message to the lobby: ${type} ${JSON.stringify(payload)}`);
    sendMessage(type, payload, state.getAllOtherPlayersInLobby(clientID));
  }

  function sendMessageInGame(clientID: m.ClientID, type: string, payload: object = {}): void {
    const opponentIds = state.getAllOpponents(clientID);
    if (opponentIds.length > 0) {
      console.log(`${clientID} sent action to ${opponentIds}: ${type}, ${JSON.stringify(payload)}`);
      sendMessage(type, payload, opponentIds);
    }
  }

  function sendChat(msg: string, recipientIDs: m.ClientID[] | null = null): void {
    sendMessage('ws:CHAT', {msg, sender: '[Server]'}, recipientIDs);
  }

  function broadcastInfo(): void {
    sendMessage('ws:INFO', state.serialize());
  }

  function setUserData(clientID: m.ClientID, userData: m.UserData): void {
    const oldUserData = state.getClientUserData(clientID);
    state.setClientUserData(clientID, userData);
    if (!oldUserData && userData) {
      sendChat(`${userData.displayName} has entered the lobby.`);
    } else if (!userData && oldUserData) {
      sendChat(`${oldUserData.displayName} has logged out.`);
    }
    broadcastInfo();
  }

  function hostGame(clientID: m.ClientID, name: string, format: m.Format, deck: m.Deck): void {
    state.hostGame(clientID, name, format, deck);
    broadcastInfo();
  }

  function joinGame(clientID: m.ClientID, opponentID: m.ClientID, deck: m.Deck): void {
    const game = state.joinGame(clientID, opponentID, deck);
    if (game) {
      const { decks, format, name, startingSeed, usernames } = game;

      sendMessage('ws:GAME_START', {player: 'blue', format, decks, usernames, seed: startingSeed }, [clientID]);
      sendMessage('ws:GAME_START', {player: 'orange', format, decks, usernames, seed: startingSeed }, [opponentID]);
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
    const game = state.spectateGame(clientID, gameID);
    if (game) {
      const { actions, decks, name, startingSeed, usernames } = game;

      sendMessage('ws:GAME_START', { player: 'neither', decks, usernames, seed: startingSeed }, [clientID]);
      sendMessage('ws:CURRENT_STATE', {actions}, [clientID]);
      sendChat(`Entering game ${name} as a spectator ...`, [clientID]);
      sendChat(`${state.getClientUsername(clientID)} has joined as a spectator.`, state.getAllOpponents(clientID));

      broadcastInfo();
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
