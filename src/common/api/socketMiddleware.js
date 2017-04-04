import * as actions from '../actions/socket';

const ENDPOINT = 'ws://socket.wordbots.io';  // Remote
// const ENDPOINT = 'wss://wordbots-socket.herokuapp.com';  // Remote (SSL)
// const ENDPOINT = 'ws://localhost:3553';  // Local

const KEEPALIVE_INTERVAL_SECS = 10;  // (Heroku kills connection after 55 idle sec.)

function createSocketMiddleware({excludedActions = []}) {
  // Don't import Colyseus at top-level because its websocket dependency crashes in node.
  const Colyseus = require('colyseus.js');
  const username = localStorage['wb$username'];

  return store => {
    let client, room, clientId, keepaliveNeeded;

    function handleAction(action, nextMiddleware) {
      if (action.type === actions.CONNECT) {
        connect();
      } else {
        send(action);
        return nextMiddleware(action);
      }
    }

    function connect() {
      store.dispatch(actions.connecting());

      client = new Colyseus.Client(ENDPOINT);
      client.onClose.add(disconnected);

      room = client.join('game', {username: username});
      room.onJoin.add(connected);
      room.state.listen('messages/', 'add', receive);
    }

    function connected() {
      clientId = client.id;
      store.dispatch(actions.connected(clientId));
    }

    function disconnected() {
      store.dispatch(actions.disconnected());
    }

    function send(action) {
      if (room && !action.fromServer && !excludedActions.includes(action.type)) {
        room.send(JSON.stringify(action));
        keepaliveNeeded = false;
      }
    }

    function receive(msg) {
      const {recipients, action} = JSON.parse(msg);
      // Accept messages directed to this client (or to everybody)
      // that *don't* have this client listed as a sender (to avoid double-counting chat messages).
      if (!recipients || (recipients.includes(clientId)) && action.payload.sender !== clientId) {
        store.dispatch(Object.assign({}, action, {fromServer: true}));
      }
    }

    function keepalive() {
      if (keepaliveNeeded) {
        send(actions.keepalive());
      }
      keepaliveNeeded = true;
    }

    setInterval(keepalive, KEEPALIVE_INTERVAL_SECS * 1000);

    return next => action => handleAction(action, next);
  };
}

export default createSocketMiddleware;
