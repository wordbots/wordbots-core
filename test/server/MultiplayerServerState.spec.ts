import { WebSocket as MockSocket } from 'mock-socket';
import { noop } from 'lodash';

import { unpackDeck } from '../../src/common/util/cards';
import defaultCollectionState from '../../src/common/store/defaultCollectionState';
import MultiplayerServerState from '../../src/server/multiplayer/MultiplayerServerState';
import * as m from '../../src/server/multiplayer/multiplayer';

type MSS = MultiplayerServerState;

const dummyWebSocket: any = new MockSocket('ws://null');
const initialState: m.SerializedServerState = {
  games: [],
  waitingPlayers: [],
  playersOnline: [],
  userData: {},
  queueSize: 0
};
const defaultDeck: m.Deck = unpackDeck(defaultCollectionState.decks[0], defaultCollectionState.cards);

function expectState(fn: (state: MSS) => void, expectedSerializedState: m.SerializedServerState): void {
  const state = new MultiplayerServerState();
  fn(state);
  expect(state.serialize()).toEqual(expectedSerializedState);
}

describe('MultiplayerServerState', () => {
  const oldConsole = {log: console.log, warn: console.warn};
  let warning: string = '';
  beforeAll(() => {
    console.log = noop;
    console.warn = (message: string) => warning = message;
  });
  afterAll(() => {
    console.log = oldConsole.log;
    console.warn = oldConsole.warn;
  });

  it('should return the initial state', () => {
    expectState(noop, initialState);
  });

  describe('[Connect/disconnect]', () => {
    it('should be able to connect a logged-in player', () => {
      expectState((state: MSS) => {
        state.connectClient('loggedInClient', dummyWebSocket);
        state.setClientUserData('loggedInClient', {uid: 'loggedInClientUid', displayName: 'loggedInClientUsername'});
      }, {
        ...initialState,
        playersOnline: ['loggedInClient'],
        userData: {
          loggedInClient: {uid: 'loggedInClientUid', displayName: 'loggedInClientUsername'}
        }
      });
    });

    it('should be able to connect a guest player', () => {
      expectState((state: MSS) => {
        state.connectClient('guestClient', dummyWebSocket);
      }, {
        ...initialState,
        playersOnline: ['guestClient']
      });
    });

    it('should be able to disconnect a player', () => {
      expectState((state: MSS) => {
        state.connectClient('guestClient', dummyWebSocket);
        state.disconnectClient('guestClient');
      }, initialState);
    });
  });

  describe('[Hosting/joining games]', () => {
    it('should be able to host a game', () => {
      expectState((state: MSS) => {
        state.connectClient('host', dummyWebSocket);
        state.setClientUserData('host', {uid: 'hostId', displayName: 'hostName'});
        state.hostGame('host', 'My Game', 'normal', defaultDeck);
      }, {
        ...initialState,
        playersOnline: ['host'],
        userData: { host: {uid: 'hostId', displayName: 'hostName'} },
        waitingPlayers: [
          {
            deck: defaultDeck,
            format: 'normal',
            id: 'host',
            name: 'My Game',
            options: {},
            players: ['host']
          }
        ]
      });
    });

    it('should NOT be able to host a game as a guest', () => {
      expectState((state: MSS) => {
        state.connectClient('host', dummyWebSocket);
        state.hostGame('host', 'My Game', 'normal', defaultDeck);
      }, {
        ...initialState,
        playersOnline: ['host']
      });
      expect(warning).toEqual('Guest_host tried to start game My Game but they weren\'t logged in.');
    });

    it('should NOT be able to host a game with an invalid deck', () => {
      expectState((state: MSS) => {
        state.connectClient('host', dummyWebSocket);
        state.setClientUserData('host', {uid: 'hostId', displayName: 'hostName'});
        state.hostGame('host', 'My Game', 'normal', {id: '', name: '', cardIds: [], cards: []});
      }, {
        ...initialState,
        playersOnline: ['host'],
        userData: { host: {uid: 'hostId', displayName: 'hostName'} }
      });
      expect(warning).toEqual('hostName tried to start game My Game but their deck was invalid for the normal format.');
    });

    it('should be able to cancel hosting a game', () => {
      expectState((state: MSS) => {
        state.connectClient('host', dummyWebSocket);
        state.setClientUserData('host', {uid: 'hostId', displayName: 'hostName'});
        state.hostGame('host', 'My Game', 'normal', defaultDeck);
        state.cancelHostingGame('host');
      }, {
        ...initialState,
        playersOnline: ['host'],
        userData: { host: {uid: 'hostId', displayName: 'hostName'} }
      });
    });
  });

  /*describe('[Queuing]', () => {

  });*/
});
