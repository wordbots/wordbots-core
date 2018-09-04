import { WebSocket as MockSocket } from 'mock-socket';
import { noop } from 'lodash';

import * as w from '../../src/common/types';
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
const defaultDecks: m.Deck[] = defaultCollectionState.decks.map((d: w.DeckInStore) => unpackDeck(d, defaultCollectionState.cards));

function expectState(fn: (state: MSS) => void, expectedSerializedState: m.SerializedServerState): void {
  const state = new MultiplayerServerState();
  fn(state);
  expect(state.serialize()).toEqual(expectedSerializedState);
}
function expectStateFn(fn: (state: MSS) => void, expectedSerializedStateFn: (state: MSS) => m.SerializedServerState): void {
  const state = new MultiplayerServerState();
  fn(state);
  expect(state.serialize()).toEqual(expectedSerializedStateFn(state));
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
        state.hostGame('host', 'My Game', 'normal', defaultDecks[0]);
      }, {
        ...initialState,
        playersOnline: ['host'],
        userData: { host: {uid: 'hostId', displayName: 'hostName'} },
        waitingPlayers: [
          {
            deck: defaultDecks[0],
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
        state.hostGame('host', 'My Game', 'normal', defaultDecks[0]);
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
        state.hostGame('host', 'My Game', 'normal', defaultDecks[0]);
        state.cancelHostingGame('host');
      }, {
        ...initialState,
        playersOnline: ['host'],
        userData: { host: {uid: 'hostId', displayName: 'hostName'} }
      });
    });

    it('should be able to join a hosted game (even as a guest)', () => {
      expectStateFn((state: MSS) => {
        state.connectClient('host', dummyWebSocket);
        state.connectClient('guest', dummyWebSocket);
        state.setClientUserData('host', {uid: 'hostId', displayName: 'hostName'});
        state.hostGame('host', 'My Game', 'normal', defaultDecks[0]);
        state.joinGame('guest', 'host', defaultDecks[1]);
      }, (state: MSS) => ({
        ...initialState,
        games: [
          {
            ...state.lookupGameByClient('guest') as m.Game,
            players: ['guest', 'host']
          }
        ],
        playersOnline: ['host', 'guest'],
        userData: { host: {uid: 'hostId', displayName: 'hostName'} }
      }));
    });

    it('should NOT be able to join a game with an invalid deck', () => {
      expectState((state: MSS) => {
        state.connectClient('host', dummyWebSocket);
        state.connectClient('guest', dummyWebSocket);
        state.setClientUserData('host', {uid: 'hostId', displayName: 'hostName'});
        state.hostGame('host', 'My Game', 'normal', defaultDecks[0]);
        state.joinGame('guest', 'host', {id: '', name: '', cardIds: [], cards: []});
      }, {
        ...initialState,
        playersOnline: ['host', 'guest'],
        userData: { host: {uid: 'hostId', displayName: 'hostName'} },
        waitingPlayers: [
          {
            deck: defaultDecks[0],
            format: 'normal',
            id: 'host',
            name: 'My Game',
            options: {},
            players: ['host']
          }
        ]
      });
      expect(warning).toEqual('Guest_guest was unable to join hostName\'s game.');
    });

    it('should be able to join an active game as a spectator', () => {
      expectStateFn((state: MSS) => {
        state.connectClient('host', dummyWebSocket);
        state.connectClient('guest', dummyWebSocket);
        state.connectClient('spectator', dummyWebSocket);
        state.setClientUserData('host', {uid: 'hostId', displayName: 'hostName'});
        state.hostGame('host', 'My Game', 'normal', defaultDecks[0]);
        state.joinGame('guest', 'host', defaultDecks[1]);
        state.spectateGame('spectator', (state.lookupGameByClient('guest') as m.Game).id);
      }, (state: MSS) => ({
        ...initialState,
        games: [
          {
            ...state.lookupGameByClient('guest') as m.Game,
            spectators: ['spectator']
          }
        ],
        playersOnline: ['host', 'guest', 'spectator'],
        userData: { host: {uid: 'hostId', displayName: 'hostName'} }
      }));
    });
  });

  describe('[Queuing]', () => {
    xit('should be able to join the unranked queue', noop);
    xit('should NOT be able to join the unranked queue as a guest', noop);
    xit('should NOT be able to join the unranked queue with an invalid deck', noop);
    xit('should be able to leave the unranked queue', noop);
    xit('should be matched as soon as there is more than one player in the unranked queue for a given format', noop);  // TODO this behavior will change once there is "real" matchmaking
    xit('should NOT be matched against a player in a different format', noop);
  });

  describe('[Gameplay and game end]', () => {
    xit('should store game actions', noop);
    xit('should handle the end of the game', noop);
    xit('should be able to leave the game', noop);
  });
});
