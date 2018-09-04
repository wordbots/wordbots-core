import { WebSocket as MockSocket } from 'mock-socket';
import { noop } from 'lodash';

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

function expectState(fn: (state: MSS) => void, expectedSerializedState: m.SerializedServerState): void {
  const state = new MultiplayerServerState();
  fn(state);
  expect(state.serialize()).toEqual(expectedSerializedState);
}

describe('MultiplayerServerState', () => {
  const oldConsoleLog = console.log;
  beforeAll(() => { console.log = noop; });
  afterAll(() => { console.log = oldConsoleLog; });

  it('should return the initial state', () => {
    expectState(noop, initialState);
  });

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
