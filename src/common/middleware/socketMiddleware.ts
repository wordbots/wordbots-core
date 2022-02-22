import * as fb from 'firebase';
import * as Flatted from 'flatted';
import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from 'redux';

import * as ga from '../actions/global';
import * as sa from '../actions/socket';
import { LOG_SOCKET_IO } from '../constants';
import * as w from '../types';

const KEEPALIVE_INTERVAL_SECS = 5;  // (Heroku kills connection after 55 idle sec.)

interface SocketMiddlewareOpts {
  excludedActions: w.ActionType[]
}

// Middleware creator that builds socketMiddleware given SocketMiddlewareOpts.
function socketMiddleware({ excludedActions }: SocketMiddlewareOpts): Middleware {
  return (store: MiddlewareAPI<Dispatch<AnyAction>, w.State>) => {
    let socket: WebSocket;
    let keepaliveNeeded = false;
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
      } else {
        if (action.type === ga.LOGGED_IN) {
          user = action.payload.user;
          send(sa.sendUserData(action.payload.user));
        } else if (action.type === ga.LOGGED_OUT) {
          if (user) {
            user = undefined;
            send(sa.sendUserData(undefined));
          }
        } else {
          send(action);
        }
      }

      return next(action);
    }

    function connect(): void {
      store.dispatch(sa.connecting());

      const protocol = window.location.protocol.includes('https') ? 'wss' : 'ws';
      socket = new WebSocket(`${protocol}://${window.location.host}/socket`);
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

    function disconnected(): void {
      store.dispatch(sa.disconnected());
    }

    function send(action: AnyAction): void {
      if (socket && !action.fromServer && !excludedActions.includes(action.type)) {
        // Either send the action or queue it to send later.
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(Flatted.stringify(action));
          logSocketMsg(`Sent ${Flatted.stringify(action)}.`);
          keepaliveNeeded = false;
        } else {
          sendQueue.push(action);
        }
      }
    }

    function receive(event: { data: string }): void {
      const msg = event.data;
      const action = Flatted.parse(msg);

      logSocketMsg(`Received ${msg}.`);
      store.dispatch({...action, fromServer: true});
    }

    function keepalive(): void {
      if (socket) {
        // If the socket is open, keepalive if necessary. If the socket is closed, try to re-open it.
        if (socket.readyState === WebSocket.CLOSED) {
          connect();
        } else if (socket.readyState === WebSocket.OPEN && keepaliveNeeded) {
          socket.send(Flatted.stringify(sa.keepalive()));
        }
      }
      keepaliveNeeded = true;
    }

    setInterval(keepalive, KEEPALIVE_INTERVAL_SECS * 1000);

    return (next: Dispatch<AnyAction>) => (action: AnyAction) => handleAction(action, next);
  };
}

export default socketMiddleware;
