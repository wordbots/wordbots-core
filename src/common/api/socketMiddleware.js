import { LOG_SOCKET_IO } from '../constants';
import { logIfFlagSet } from '../util/common';
import * as actions from '../actions/socket';

// const ENDPOINT = 'ws://app.wordbots.io/socket';  // Remote
// const ENDPOINT = 'wss://wordbots-game.herokuapp.com/socket';  // Remote (SSL)
const ENDPOINT = 'ws://localhost:3000/socket';  // Local

const KEEPALIVE_INTERVAL_SECS = 5;  // (Heroku kills connection after 55 idle sec.)

function createSocketMiddleware({excludedActions = []}) {
  return store => {
    let socket, keepaliveNeeded;

    const sendQueue = [];

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

      socket = new WebSocket(ENDPOINT);
      socket.onopen = connected;
      socket.onclose = disconnected;
      socket.onmessage = receive;
    }

    function connected() {
      store.dispatch(actions.connected());
      send(actions.setUsername(localStorage['wb$username']));

      while (sendQueue.length > 0) {
        send(sendQueue.shift());
      }
    }

    function disconnected() {
      console.log('Disconnected!');
      store.dispatch(actions.disconnected());
    }

    function send(action) {
      if (socket && !action.fromServer && !excludedActions.includes(action.type)) {
        // Either send the action or queue it to send later.
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify(action));
          logIfFlagSet(LOG_SOCKET_IO, `Sent ${JSON.stringify(action)}.`);
          keepaliveNeeded = false;
        } else {
          sendQueue.push(action);
        }
      }
    }

    function receive(event) {
      keepaliveNeeded = false;

      const msg = event.data;
      const action = JSON.parse(msg);

      logIfFlagSet(LOG_SOCKET_IO, `Received ${msg}.`);
      store.dispatch(Object.assign({}, action, {fromServer: true}));
    }

    function keepalive() {
      if (socket) {
        // If the socket is open, keepalive if necessary. If the socket is closed, try to re-open it.
        if (socket.readyState === WebSocket.CLOSED) {
          console.log('Reconnecting ...');
          connect();
        } else if (socket.readyState === WebSocket.OPEN && keepaliveNeeded) {
          socket.send(JSON.stringify(actions.keepalive()));
        }
      }
      keepaliveNeeded = true;
    }

    setInterval(keepalive, KEEPALIVE_INTERVAL_SECS * 1000);

    return next => action => handleAction(action, next);
  };
}

export default createSocketMiddleware;
