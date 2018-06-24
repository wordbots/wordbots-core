import WebSocket from 'ws';
import { noop } from 'lodash';

import { id as generateID } from '../../common/util/common';
import { opponent as opponentOf } from '../../common/util/game';

import MultiplayerServerState from './MultiplayerServerState.ts';

const QUEUE_INTERVAL_MSECS = 500;

/* eslint-disable no-console */
export default function launchWebsocketServer(server, path) {
  const state = new MultiplayerServerState();

  const wss = new WebSocket.Server({
    server: server,
    path: '/socket',
    perMessageDeflate: false
  });

  wss.on('listening', onOpen);
  wss.on('connection', onConnect);

  function onOpen() {
    const addr = wss.options.server.address();
    console.log(`WebSocket listening at http://${addr.address}:${addr.port}${path}`);

    setInterval(performMatchmaking, QUEUE_INTERVAL_MSECS);
  }

  function onConnect(socket) {
    const clientID = generateID();
    state.connectClient(clientID, socket);
    broadcastInfo();

    socket.on('message', msg => {
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

  function onMessage(clientID, data) {
    const {type, payload} = JSON.parse(data);
    if (type !== 'ws:KEEPALIVE') {
      console.log(`< ${data}`);
    }

    if (type === 'ws:HOST') {
      hostGame(clientID, payload.name, payload.format, payload.deck);
    } else if (type === 'ws:JOIN') {
      joinGame(clientID, payload.id, payload.deck);
    } else if (type === 'ws:JOIN_QUEUE') {
      joinQueue(clientID, payload.deck);
    } else if (type === 'ws:LEAVE_QUEUE') {
      leaveQueue(clientID);
    } else if (type === 'ws:SPECTATE') {
      spectateGame(clientID, payload.id, payload.deck);
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

  function onDisconnect(clientID) {
    const game = state.disconnectClient(clientID);
    sendChat(`${state.getClientUsername(clientID)} has left.`);
    if (game) {
      sendMessageInGame(clientID, 'ws:FORFEIT', {'winner': opponentOf(game.playerColors[clientID])});
    }
  }

  function sendMessage(type, payload = {}, recipientIDs = null) {
    const message = JSON.stringify({type, payload});
    state.getClientSockets(recipientIDs).forEach(socket => {
      try {
        socket.send(message);
        console.log(`> ${message}`);
      } catch (err) {
        console.warn(`Failed to send message ${message} to ${recipientIDs}: ${err.message}`);
      }
    });
  }

  function sendMessageInLobby(clientID, type, payload = {}) {
    console.log(`${clientID} broadcast a message to the lobby: ${type} ${JSON.stringify(payload)}`);
    sendMessage(type, payload, state.getAllOtherPlayersInLobby(clientID));
  }

  function sendMessageInGame(clientID, type, payload = {}) {
    const opponentIds = state.getAllOpponents(clientID);
    if (opponentIds.length > 0) {
      console.log(`${clientID} sent action to ${opponentIds}: ${type}, ${JSON.stringify(payload)}`);
      sendMessage(type, payload, opponentIds);
    }
  }

  function sendChat(msg, recipientIDs = null) {
    sendMessage('ws:CHAT', {msg: msg, sender: '[Server]'}, recipientIDs);
  }

  function broadcastInfo() {
    sendMessage('ws:INFO', state.serialize());
  }

  function setUserData(clientID, userData) {
    const oldUserData = state.getClientUserData(clientID, false);
    state.setClientUserData(clientID, userData);
    if (!oldUserData && userData) {
      sendChat(`${userData.displayName} has entered the lobby.`);
    } else if (!userData && oldUserData) {
      sendChat(`${oldUserData.displayName} has logged out.`);
    }
    broadcastInfo();
  }

  function hostGame(clientID, name, format, deck) {
    state.hostGame(clientID, name, format, deck);
    broadcastInfo();
  }

  function joinGame(clientID, opponentID, deck) {
    const game = state.joinGame(clientID, opponentID, deck);
    if (game) {
      const { decks, format, name, startingSeed, usernames } = game;

      sendMessage('ws:GAME_START', {'player': 'blue', format, decks, usernames, seed: startingSeed }, [clientID]);
      sendMessage('ws:GAME_START', {'player': 'orange', format, decks, usernames, seed: startingSeed }, [opponentID]);
      sendChat(`Entering game ${name} ...`, [clientID, opponentID]);
      broadcastInfo();
    }
  }

  function joinQueue(clientID, deck) {
    state.joinQueue(clientID, deck);
    broadcastInfo();
  }

  function leaveQueue(clientID) {
    state.leaveQueue(clientID);
    broadcastInfo();
  }

  function spectateGame(clientID, gameID) {
    const game = state.spectateGame(clientID, gameID);
    if (game) {
      const { actions, decks, name, startingSeed, usernames } = game;

      sendMessage('ws:GAME_START', { player: 'neither', decks, usernames, seed: startingSeed }, [clientID]);
      sendMessage('ws:CURRENT_STATE', {'actions': actions}, [clientID]);
      sendChat(`Entering game ${name} as a spectator ...`, [clientID]);
      sendChat(`${state.getClientUsername(clientID)} has joined as a spectator.`, state.getAllOpponents(clientID));

      broadcastInfo();
    }
  }

  function leaveGame(clientID) {
    state.leaveGame(clientID);
    sendChat('Entering the lobby ...', [clientID]);
    broadcastInfo();
  }

  function performMatchmaking() {
    const newGames = state.matchPlayersIfPossible();
    newGames.forEach(game => {
      const { decks, name, startingSeed, usernames } = game;

      sendMessage('ws:GAME_START', {'player': 'blue', decks, usernames, seed: startingSeed }, [game.ids.blue]);
      sendMessage('ws:GAME_START', {'player': 'orange', decks, usernames, seed: startingSeed }, [game.ids.orange]);
      sendChat(`Entering game ${name} ...`, [game.players]);

      broadcastInfo();
    });
  }
}
