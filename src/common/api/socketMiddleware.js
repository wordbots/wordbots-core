import * as actions from '../actions/socket';

const endpoint = 'ws://wordbots-socket.herokuapp.com';
//const endpoint = 'ws://localhost:3553';
const roomName = 'game';

const createSocketMiddleware = (function (opts) {
  // Don't import Colyseus at top-level because its websocket dependency crashes in node.
  const Colyseus = require('colyseus.js');
  const client = new Colyseus.Client(endpoint);

  return store => {
    store.dispatch(actions.connecting());
    const room = client.join(roomName);
    let clientId = null;
    let keepaliveNeeded = true;

    room.onJoin.add(() => {
      clientId = client.id;
      store.dispatch(actions.connected());
    });

    room.state.listen('messages/', 'add', (msg) => {
      msg = JSON.parse(msg);
      if (!msg.id || msg.id === clientId) {
        store.dispatch(Object.assign({}, msg.action, {receivedFromSocket: true}));
      }
    });

    // Heroku requires keepalives at least every 55 sec.
    setInterval(() => {
      console.log(keepaliveNeeded);
      if (keepaliveNeeded) {
        room.send(JSON.stringify(actions.keepalive()));
      }
      keepaliveNeeded = true;
    }, 30 * 1000);

    function handleMessage(action) {
      if (room &&
          !action.receivedFromSocket &&
          !(opts.excludedActions || []).includes(action.type)) {
        room.send(JSON.stringify(action));
        keepaliveNeeded = false;
      }
    }

    return next => action => {
      handleMessage(action);

      // Pass action to next middleware.
      return next(action);
    };
  };

});

export default createSocketMiddleware;
