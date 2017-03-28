//const endpoint = 'ws://wordbots-socket.herokuapp.com';
const endpoint = 'ws://localhost:3553';
const roomName = 'game';

const createSocketMiddleware = (function (opts) {
  const Colyseus = require('colyseus.js');
  const client = new Colyseus.Client(endpoint);

  return store => {
    store.dispatch({type: 'ws:CONNECTING'});
    const room = client.join(roomName);
    let clientId = null;

    room.onJoin.add(() => {
      clientId = client.id;
      store.dispatch({type: 'ws:CONNECTED'});
    });

    room.state.listen('messages/', 'add', (msg) => {
      msg = JSON.parse(msg);
      if (!msg.id || msg.id === clientId) {
        store.dispatch(Object.assign({}, msg.action, {receivedFromSocket: true}));
      }
    });

    function handleMessage(action) {
      if (room &&
          !action.receivedFromSocket &&
          !(opts.excludedActions || []).includes(action.type)) {
        room.send(JSON.stringify(action));
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
