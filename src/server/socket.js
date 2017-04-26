import WebSocket from 'ws';
import { values } from 'lodash';

import { id as generateID } from '../common/util/common';
import { opponent as opponentOf } from '../common/util/game';

/* eslint-disable no-console */
export default function launchWebsocketServer(server, path) {
  const state = {
    connections: {},
    games: [],
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
        if (oldUsername === 'Guest') {
          sendChat(`${payload.username} has logged in.`);
        } else if (payload.username === 'Guest') {
          sendChat(`${oldUsername} has logged out.`);
        } else {
          sendChat(`${oldUsername} has changed their name to ${payload.username}.`);
        }
      }
      broadcastInfo();
    } else if (type === 'ws:CHAT') {
      const inGame = findOpponents(clientID);
      const payloadWithSender = Object.assign({}, payload, {sender: clientID});
      (inGame ? sendMessageInGame : sendMessageInLobby)(clientID, 'ws:CHAT', payloadWithSender);
    } else if (type !== 'ws:KEEPALIVE') {
      handleGameAction(clientID, {type, payload});
      sendMessageInGame(clientID, type, payload);
    }
  }

  function onDisconnect(clientID) {
    const game = state.games.find(m => m.players.includes(clientID));

    state.playersOnline = state.playersOnline.filter(p => p !== clientID);
    state.waitingPlayers = state.waitingPlayers.filter(p => p.id !== clientID);

    console.log(`${clientID} left the room.`);
    sendChat(`${state.usernames[clientID] || clientID} has left.`);
    if (game) {
      sendMessageInGame(clientID, 'ws:FORFEIT', {'winner': opponentOf(game.playerColors[clientID])});
    }
    leaveGame(clientID);
  }

  function findOpponents(clientID) {
    const game = state.games.find(m => m.players.includes(clientID) || m.spectators.includes(clientID));
    if (game) {
      return game.players
               .concat(game.spectators)
               .filter(id => id !== clientID);
    }
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

  function sendMessageInLobby(clientID, type, payload = {}) {
    const inGamePlayerIds = state.games.reduce((acc, game) => acc.concat(game.players), []);
    const playersInLobby = state.playersOnline.filter(id => id !== clientID && !inGamePlayerIds.includes(id));

    console.log(`${clientID} broadcast a message to the lobby: ${type} ${JSON.stringify(payload)}`);
    sendMessage(type, payload, playersInLobby);
  }

  function sendMessageInGame(clientID, type, payload = {}) {
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
      games: state.games,
      waitingPlayers: state.waitingPlayers,
      playersOnline: state.playersOnline,
      usernames: state.usernames
    });
  }

  function handleGameAction(clientID, action) {
    const game = state.games.find(g => g.players.includes(clientID));
    if (game) {
      game.actions.push(action);
    }
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
    const seed = generateID();

    state.waitingPlayers = state.waitingPlayers.filter(p => p.id !== opponentID);
    state.games.push({
      id: opponentID,
      name: gameName,

      players: [clientID, opponentID],
      playerColors: {[clientID]: 'blue', [opponentID]: 'orange'},
      spectators: [],

      actions: [],
      decks: decks,
      usernames: usernames,
      startingSeed: seed
    });

    console.log(`${clientID} joined game ${gameName} against ${opponentID}.`);
    sendMessage('ws:GAME_START', {'player': 'blue', 'decks': decks, 'usernames': usernames, 'seed': seed}, [clientID]);
    sendMessage('ws:GAME_START', {'player': 'orange', 'decks': decks, 'usernames': usernames, 'seed': seed}, [opponentID]);
    sendChat(`Entering game ${gameName} ...`, [clientID, opponent.id]);
    broadcastInfo();
  }

  function spectateGame(clientID, gameID) {
    const game = state.games.find(g => g.id === gameID);

    if (game) {
      game.spectators.push(clientID);

      console.log(`${clientID} joined game ${game.name} as a spectator.`);
      sendMessage('ws:GAME_START', {
        'player': 'neither',
        'decks': game.decks,
        'usernames': game.usernames,
        'seed': game.startingSeed
      }, [clientID]);
      sendMessage('ws:CURRENT_STATE', {'actions': game.actions}, [clientID]);
      sendChat(`Entering game ${game.name} as a spectator ...`, [clientID]);
      sendChat(`${state.usernames[clientID]} has joined as a spectator.`, findOpponents(clientID));
      broadcastInfo();
    }
  }

  function leaveGame(clientID) {
    function withoutClient(game) {
      return Object.assign(game, {
        players: game.players.filter(p => p !== clientID),
        spectator: game.players.filter(p => p !== clientID)
      });
    }

    state.games = state.games.map(withoutClient).filter(game => game.players.length >= 2);

    sendChat('Entering the lobby ...', [clientID]);
    broadcastInfo();
  }
}
