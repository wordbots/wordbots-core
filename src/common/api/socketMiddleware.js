import * as actions from '../actions/socket';

const endpoint = 'wss://wordbots-socket.herokuapp.com';
// const endpoint = 'ws://localhost:3553';

const roomName = 'game';

const createSocketMiddleware = (function ({excludedActions = []}) {
  // Don't import Colyseus at top-level because its websocket dependency crashes in node.
  const Colyseus = require('colyseus.js');

  return store => {
    const username = localStorage['wb$username'];

    let client, room, clientId;
    let keepaliveNeeded = true;

    function handleAction(action, next) {
      if (action.type === actions.RECONNECT) {
        connect();
      }

      send(action);
      return next(action); // Pass action to next middleware.
    }

    function connect() {
      store.dispatch(actions.connecting());

      client = new Colyseus.Client(endpoint);
      client.onClose.add(disconnected);

      room = client.join(roomName, {username: username});
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
      // that *don't* have this client listed as a sender
      // (this is to avoid double-counting chat messages - only chat messages have a sender field currently).
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

    connect();
    setInterval(keepalive, 10 * 1000); // (Heroku kills connection after 55 idle sec.)

    return next => action => handleAction(action, next);
  };

});

export default createSocketMiddleware;
