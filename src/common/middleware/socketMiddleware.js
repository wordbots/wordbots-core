import { LOG_SOCKET_IO } from '../constants';
import { logIfFlagSet } from '../util/browser';
import * as ga from '../actions/global';
import * as sa from '../actions/socket';

/* eslint-disable unicorn/prefer-add-event-listener */

const KEEPALIVE_INTERVAL_SECS = 5;  // (Heroku kills connection after 55 idle sec.)

function createSocketMiddleware({excludedActions = []}) {
  return store => {
    let socket, keepaliveNeeded, user;
    let sendQueue = [];

    function handleAction(action, nextMiddleware) {
      if (action.type === sa.CONNECT) {
        connect();
      } else {
        if (action.type === ga.LOGGED_IN) {
          user = action.payload.user;
          send(sa.sendUserData(action.payload.user));
        } else if (action.type === ga.LOGGED_OUT) {
          user = undefined;
          send(sa.sendUserData(undefined));
        } else {
          send(action);
        }

        return nextMiddleware(action);
      }
    }

    function connect() {
      store.dispatch(sa.connecting());

      socket = new WebSocket(`ws://${window.location.host}/socket`);
      socket.onopen = connected;
      socket.onclose = disconnected;
      socket.onmessage = receive;
    }

    function connected() {
      store.dispatch(sa.connected());
      send(sa.sendUserData(user));

      sendQueue.forEach(send);
      sendQueue = [];
    }

    function disconnected() {
      store.dispatch(sa.disconnected());
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
      const msg = event.data;
      const action = JSON.parse(msg);

      logIfFlagSet(LOG_SOCKET_IO, `Received ${msg}.`);
      store.dispatch(Object.assign({}, action, {fromServer: true}));
    }

    function keepalive() {
      if (socket) {
        // If the socket is open, keepalive if necessary. If the socket is closed, try to re-open it.
        if (socket.readyState === WebSocket.CLOSED) {
          connect();
        } else if (socket.readyState === WebSocket.OPEN && keepaliveNeeded) {
          socket.send(JSON.stringify(sa.keepalive()));
        }
      }
      keepaliveNeeded = true;
    }

    setInterval(keepalive, KEEPALIVE_INTERVAL_SECS * 1000);

    return next => action => handleAction(action, next);
  };
}

export default createSocketMiddleware;
