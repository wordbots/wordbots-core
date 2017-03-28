import * as Colyseus from 'colyseus.js';

const client = new Colyseus.Client('ws://wordbots-socket.herokuapp.com');
//const client = new Colyseus.Client('ws://localhost:3553');
const roomName = 'game';

const socketMiddleware = (function (opts) {
  let room = null;
  let clientId = null;

  function connect(store, payload) {
    room = client.join(roomName, {decks: payload.decks});

    room.onJoin.add(() => {
      clientId = client.id;
      console.log(`${client.id} joined ${room.name}`);
      store.dispatch({type: 'ws:CONNECTED'});
    });

    room.state.listen('messages/', 'add', (msg) => {
      msg = JSON.parse(msg);
      if (msg.id === clientId) {
        store.dispatch(Object.assign({}, msg.action, {receivedFromSocket: true}));
      }
    });
  }

  function handleMessage(action) {
    if (room &&
        !action.receivedFromSocket &&
        !(opts.excludedActions || []).includes(action.type)) {
      room.send(JSON.stringify(action));
    }
  }

  return store => next => action => {
    if (action.type === 'ws:CONNECT') {
      store.dispatch({type: 'ws:CONNECTING'});
      connect(store, action.payload);
    } else if (action.type === 'ws:DISCONNECT') {
      // TODO
    } else if (action.type === 'ws:LEFT') {
      console.log('Opponent has left!');
    } else {
      handleMessage(action);
    }

    // Pass action to next middleware.
    return next(action);
  };

});

export default socketMiddleware;
