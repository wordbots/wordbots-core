import * as fb from 'firebase';
import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from 'redux';

import * as w from '../types';
import { LOG_SOCKET_IO } from '../constants';
import { webSocketRoot } from '../util/browser';
import * as ga from '../actions/global';
import * as sa from '../actions/socket';

const KEEPALIVE_INTERVAL_SECS = 5;  // (Heroku kills connection after 55 idle sec.)

interface SocketMiddlewareOpts {
  forwardedActionTypes: w.ActionType[]
}

// Middleware creator that builds socketMiddleware given SocketMiddlewareOpts.
function socketMiddleware({ forwardedActionTypes }: SocketMiddlewareOpts): Middleware {
  return (store: MiddlewareAPI<Dispatch<AnyAction>, w.State>) => {
    let socket: WebSocket;
    let keepaliveNeeded = false;
    let keepClosed = false;
    let user: fb.User | undefined;
    let sendQueue: AnyAction[] = [];

    function logSocketMsg(msg: string): void {
      if (LOG_SOCKET_IO) {
        console.log(msg); // eslint-disable-line  no-console
      }
    }

    function handleAction(action: AnyAction, next: Dispatch<AnyAction>): AnyAction {
      if (action.type === sa.CONNECT) {
        connect();
      } else if (action.type === sa.DISCONNECT) {
        disconnect();
      } else {
        if (action.type === ga.LOGGED_IN) {
          user = action.payload.user;
          send(sa.sendUserData(action.payload.user));
        } else if (action.type === ga.LOGGED_OUT) {
          if (user) {
            user = undefined;
            send(sa.sendUserData(undefined));
          }
        } else if (forwardedActionTypes.includes(action.type) && !action.fromServer) {
          send(action);
        }
      }

      return next(action);
    }

    function connect(): void {
      store.dispatch(sa.connecting());

      keepClosed = false;
      socket = new WebSocket(`${webSocketRoot()}/socket`);
      socket.addEventListener('open', connected);
      socket.onclose = disconnected;
      socket.addEventListener('message', receive);
    }

    function connected(): void {
      store.dispatch(sa.connected());
      send(sa.sendUserData(user));

      sendQueue.forEach(send);
      sendQueue = [];
    }

    function disconnect(): void {
      store.dispatch(sa.disconnected(true));

      keepClosed = true;
      if (socket) {
        socket.close();
      }
    }

    function disconnected(): void {
      store.dispatch(sa.disconnected());
    }

    function send(action: AnyAction): void {
      if (socket) {
        // Either send the action or queue it to send later.
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify(action));
          logSocketMsg(`Sent ${JSON.stringify(action)}.`);
          keepaliveNeeded = false;
        } else {
          sendQueue.push(action);
        }
      }
    }

    function receive(event: { data: string }): void {
      const msg = event.data;
      const action = JSON.parse(msg);

      logSocketMsg(`Received ${msg}.`);
      store.dispatch({ ...action, fromServer: true });
    }

    function keepalive(): void {
      if (socket) {
        // If the socket is open, keepalive if necessary. If the socket is closed, try to re-open it (unless it's meant to be closed).
        if (socket.readyState === WebSocket.CLOSED && !keepClosed) {
          connect();
        } else if (socket.readyState === WebSocket.OPEN && keepaliveNeeded) {
          socket.send(JSON.stringify(sa.keepalive()));
        }
      }
      keepaliveNeeded = true;
    }

    setInterval(keepalive, KEEPALIVE_INTERVAL_SECS * 1000);

    return (next: Dispatch<AnyAction>) => (action: AnyAction) => handleAction(action, next);
  };
}

export default socketMiddleware;
