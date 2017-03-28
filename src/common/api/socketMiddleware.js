import * as actions from '../actions/socket';

const endpoint = 'ws://wordbots-socket.herokuapp.com';
//const endpoint = 'ws://localhost:3553';
const roomName = 'game';

const createSocketMiddleware = (function ({excludedActions = []}) {
  // Don't import Colyseus at top-level because its websocket dependency crashes in node.
  const Colyseus = require('colyseus.js');
  const client = new Colyseus.Client(endpoint);

  return store => {
    const room = client.join(roomName);
    let clientId = null;
    let keepaliveNeeded = true;

    function connected() {
      clientId = client.id;
      store.dispatch(actions.connected());
    }

    function send(action) {
      if (room && !action.fromServer && !excludedActions.includes(action.type)) {
        room.send(JSON.stringify(action));
        keepaliveNeeded = false;
      }
    }

    function receive(msg) {
      const {id, action} = JSON.parse(msg);
      if (!id || id === clientId) {
        store.dispatch(Object.assign({}, action, {fromServer: true}));
      }
    }

    function keepAlive() {
      if (keepaliveNeeded) {
        room.send(JSON.stringify(actions.keepalive()));
      }
      keepaliveNeeded = true;
    }

    store.dispatch(actions.connecting());
    room.onJoin.add(connected);
    room.state.listen('messages/', 'add', receive);
    setInterval(keepAlive, 30 * 1000); // (Heroku kills connection after 55 idle sec.)

    return next => action => {
      send(action);
      return next(action); // Pass action to next middleware.
    };
  };

});

export default createSocketMiddleware;
