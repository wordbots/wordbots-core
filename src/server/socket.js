import WebSocket from 'ws';
import { values } from 'lodash';

import { id as generateID } from '../common/util/common';

/* eslint-disable no-console */
export default function launchWebsocketServer(server, path) {
  const state = {
    connections: {},
    matches: [],
    waitingPlayers: [],
    playersOnline: [],
    usernames: {}
  };

  const wss = new WebSocket.Server({
    server: server,
    path: '/socket',
    perMessageDeflate: false
  });

  wss.on('listening', onOpen);
  wss.on('connection', socket => {
    const clientID = generateID();
    state.connections[clientID] = socket;

    onConnect(clientID);
    socket.on('message', msg => {
      onMessage(clientID, msg);
    });
    socket.on('close', () => {
      onDisconnect(clientID);
      delete state.connections[clientID];
    });
  });

  function onOpen() {
    const addr = wss.options.server.address();
    console.log(`WebSocket listening at http://${addr.address}:${addr.port}${path}`);
  }

  function onConnect(clientID) {
    console.log(`${clientID} joined the room.`);
    state.playersOnline.push(clientID);
    broadcastInfo();
  }

  function onMessage(clientID, data) {
    const {type, payload} = JSON.parse(data);
    const inGame = findOpponents(clientID) !== null;

    if (type === 'ws:HOST') {
      hostGame(clientID, payload.name, payload.deck);
    } else if (type === 'ws:JOIN') {
      joinGame(clientID, payload.id, payload.deck);
    } else if (type === 'ws:SPECTATE') {
      spectateGame(clientID, payload.id, payload.deck);
    } else if (type === 'ws:LEAVE') {
      leaveGame(clientID);
    } else if (type === 'ws:SET_USERNAME') {
      const oldUsername = state.usernames[clientID];
      state.usernames[clientID] = payload.username;
      if (!oldUsername) {
        sendChat(`${payload.username || clientID} has entered the lobby.`);
      } else if (oldUsername !== payload.username) {
        sendChat(`${oldUsername} has changed their name to ${payload.username}.`);
      }
      broadcastInfo();
    } else if (type === 'ws:CHAT') {
      const payloadWithSender = Object.assign({}, payload, {sender: clientID});
      (inGame ? sendMessageToOpponents : sendMessageToLobby)(clientID, 'ws:CHAT', payloadWithSender);
    } else if (type !== 'ws:KEEPALIVE') {
      sendMessageToOpponents(clientID, type, payload);
    }
  }

  function onDisconnect(clientID) {
    state.playersOnline = state.playersOnline.filter(p => p !== clientID);
    state.waitingPlayers = state.waitingPlayers.filter(p => p.id !== clientID);

    console.log(`${clientID} left the room.`);
    sendChat(`${state.usernames[clientID] || clientID} has left.`);
    sendMessageToOpponents(clientID, 'ws:OPPONENT_LEFT');
    leaveGame(clientID);
  }

  function findOpponents(clientID) {
    const match = state.matches.find(m => m.players.includes(clientID));
    return match ? match.players.filter(id => id !== clientID) : null;
  }

  function sendMessage(type, payload = {}, recipientIDs = null) {
    const sockets = recipientIDs ? recipientIDs.map(id => state.connections[id]) : values(state.connections);
    const message = JSON.stringify({type, payload});

    sockets.forEach(socket => {
      try {
        socket.send(message);
      } catch (e) {
        console.warn(`Failed to send message ${message} to ${recipientIDs}: ${e.message}`);
      }
    });
  }

  function sendMessageToLobby(clientID, type, payload = {}) {
    const inGamePlayerIds = state.matches.reduce((acc, match) => acc.concat(match.players), []);
    const playersInLobby = state.playersOnline.filter(id => id !== clientID && !inGamePlayerIds.includes(id));

    console.log(`${clientID} broadcast a message to the lobby: ${type} ${JSON.stringify(payload)}`);
    sendMessage(type, payload, playersInLobby);
  }

  function sendMessageToOpponents(clientID, type, payload = {}) {
    const opponentIds = findOpponents(clientID);
    if (opponentIds) {
      console.log(`${clientID} sent action to ${opponentIds}: ${type}, ${JSON.stringify(payload)}`);
      sendMessage(type, payload, opponentIds);
    }
  }

  function sendChat(msg, recipientIDs = null) {
    sendMessage('ws:CHAT', {msg: msg, sender: '[Server]'}, recipientIDs);
  }

  function broadcastInfo() {
    sendMessage('ws:INFO', {
      matches: state.matches,
      waitingPlayers: state.waitingPlayers,
      playersOnline: state.playersOnline,
      usernames: state.usernames
    });
  }

  function hostGame(clientID, name, deck) {
    state.waitingPlayers.push({
      id: clientID,
      name: name,
      deck: deck,
      players: [clientID]
    });

    console.log(`${clientID} started game ${name}.`);
    broadcastInfo();
  }

  function joinGame(clientID, opponentID, deck) {
    const opponent = state.waitingPlayers.find(p => p.id === opponentID);
    const usernames = {'orange': state.usernames[opponentID], 'blue': state.usernames[clientID]};
    const decks = {'orange': opponent.deck, 'blue': deck};
    const gameName = opponent.name;

    state.waitingPlayers = state.waitingPlayers.filter(p => p.id !== opponentID);
    state.matches.push({
      id: opponentID,
      name: gameName,
      decks: decks,
      players: [clientID, opponentID],
      usernames: usernames
    });

    console.log(`${clientID} joined game ${gameName} against ${opponentID}.`);
    sendMessage('ws:GAME_START', {'player': 'blue', 'decks': decks, 'usernames': usernames}, [clientID]);
    sendMessage('ws:GAME_START', {'player': 'orange', 'decks': decks, 'usernames': usernames}, [opponentID]);
    sendChat(`Entering game ${gameName} ...`, [clientID, opponent.id]);
    broadcastInfo();
  }

  function spectateGame(clientID, gameID) {
    const game = state.matches.find(g => g.id === gameID);

    game.players.push(clientID);

    console.log(`${clientID} joined game ${game.name} as a spectator.`);
    sendMessage('ws:GAME_START', {'player': 'neither', 'decks': game.decks, 'usernames': game.usernames}, [clientID]);
    sendChat(`Entering game ${game.name} as a spectator ...`, [clientID]);
    sendChat(`${state.usernames[clientID]} has joined as a spectator.`, findOpponents(clientID));
    broadcastInfo();
  }

  function leaveGame(clientID) {
    state.matches = (
      state.matches
        .map(match => Object.assign(match, {players: match.players.filter(p => p !== clientID)}))
        .filter(match => match.players >= 2)
    );

    sendChat('Entering the lobby ...', [clientID]);
    broadcastInfo();
  }
}
