import { noop } from 'lodash';
import { WebSocket as MockSocket } from 'mock-socket';
import * as WebSocket from 'ws';

import * as gameActions from '../../src/common/actions/game';
import * as m from '../../src/server/multiplayer/multiplayer';
import MultiplayerServerState from '../../src/server/multiplayer/MultiplayerServerState';
import { botsOnlyDeck, defaultDecks, emptyDeck, eventsOnlyDeck, kernelKillerDeck } from '../data/decks';

type MSS = MultiplayerServerState;

const initialState: m.SerializedServerState = {
  games: [],
  waitingPlayers: [],
  playersOnline: [],
  playersInLobby: [],
  userData: {},
  queueSize: 0
};

describe('MultiplayerServerState', () => {
  const oldConsole = { log: console.log, warn: console.warn };
  let dummyWebSocket: WebSocket;
  let warning = '';

  async function expectState(fn: (state: MSS) => Promise<void>, expectedSerializedState: m.SerializedServerState, expectedWarning?: string): Promise<void> {
    const state = new MultiplayerServerState();
    await fn(state);
    expect(state.serialize()).toEqual(expectedSerializedState);
    if (expectedWarning) {
      expect(warning).toEqual(expectedWarning);
    }
  }

  async function expectStateFn(fn: (state: MSS) => Promise<void>, expectedSerializedStateFn: (state: MSS) => m.SerializedServerState): Promise<void> {
    const state = new MultiplayerServerState();
    await fn(state);
    expect(state.serialize()).toEqual(expectedSerializedStateFn(state));
  }

  beforeAll(() => {
    dummyWebSocket = new MockSocket('ws://null') as any as WebSocket;
    console.log = noop;
    console.warn = (message: string) => warning = message;
  });

  afterAll(() => {
    console.log = oldConsole.log;
    console.warn = oldConsole.warn;
  });

  it('should return the initial state', async () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await await expectState(async () => { }, initialState);
  });

  describe('[Connect/disconnect]', () => {
    it('should be able to connect a logged-in player', async () => {
      await expectState(async (state: MSS) => {
        state.connectClient('loggedInClient', dummyWebSocket);
        state.setClientUserData('loggedInClient', { uid: 'loggedInClientUid', displayName: 'loggedInClientUsername' });
      }, {
        ...initialState,
        playersOnline: ['loggedInClient'],
        playersInLobby: ['loggedInClient'],
        userData: {
          loggedInClient: { uid: 'loggedInClientUid', displayName: 'loggedInClientUsername' }
        }
      });
    });

    it('should be able to connect a guest player', async () => {
      await expectState(async (state: MSS) => {
        state.connectClient('guestClient', dummyWebSocket);
      }, {
        ...initialState,
        playersOnline: ['guestClient'],
        playersInLobby: ['guestClient']
      });
    });

    it('should be able to disconnect a player', async () => {
      await expectState(async (state: MSS) => {
        state.connectClient('guestClient', dummyWebSocket);
        state.disconnectClient('guestClient');
      }, initialState);
    });
  });

  describe('[Hosting/joining games]', () => {
    it('should be able to host a game', async () => {
      await expectState(async (state: MSS) => {
        state.connectClient('host', dummyWebSocket);
        state.setClientUserData('host', { uid: 'hostId', displayName: 'hostName' });
        await state.hostGame('host', 'My Game', 'normal', defaultDecks[0]);
      }, {
        ...initialState,
        playersOnline: ['host'],
        playersInLobby: ['host'],
        userData: { host: { uid: 'hostId', displayName: 'hostName' } },
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

    it('should be able to host a game as a guest', async () => {
      await expectState(async (state: MSS) => {
        state.connectClient('host', dummyWebSocket);
        await state.hostGame('host', 'My Game', 'normal', defaultDecks[0]);
      }, {
        ...initialState,
        playersOnline: ['host'],
        playersInLobby: ['host'],
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

    it('should NOT be able to host a game with an invalid deck', async () => {
      await expectState(async (state: MSS) => {
        state.connectClient('host', dummyWebSocket);
        state.setClientUserData('host', { uid: 'hostId', displayName: 'hostName' });
        await state.hostGame('host', 'My Game', 'normal', emptyDeck);
      }, {
        ...initialState,
        playersOnline: ['host'],
        playersInLobby: ['host'],
        userData: { host: { uid: 'hostId', displayName: 'hostName' } }
      }, 'hostName tried to start game My Game but their deck was invalid for the normal format.');
    });

    it('should be able to cancel hosting a game', async () => {
      await expectState(async (state: MSS) => {
        state.connectClient('host', dummyWebSocket);
        state.setClientUserData('host', { uid: 'hostId', displayName: 'hostName' });
        await state.hostGame('host', 'My Game', 'normal', defaultDecks[0]);
        state.cancelHostingGame('host');
      }, {
        ...initialState,
        playersOnline: ['host'],
        playersInLobby: ['host'],
        userData: { host: { uid: 'hostId', displayName: 'hostName' } }
      });
    });

    it('should be able to join a hosted game (even as a guest)', async () => {
      await expectStateFn(async (state: MSS) => {
        state.connectClient('host', dummyWebSocket);
        state.connectClient('guest', dummyWebSocket);
        state.setClientUserData('host', { uid: 'hostId', displayName: 'hostName' });
        await state.hostGame('host', 'My Game', 'normal', defaultDecks[0]);
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
        userData: { host: { uid: 'hostId', displayName: 'hostName' } }
      }));
    });

    it('should NOT be able to join a game with an invalid deck', async () => {
      await expectState(async (state: MSS) => {
        state.connectClient('host', dummyWebSocket);
        state.connectClient('guest', dummyWebSocket);
        state.setClientUserData('host', { uid: 'hostId', displayName: 'hostName' });
        await state.hostGame('host', 'My Game', 'normal', defaultDecks[0]);
        state.joinGame('guest', 'host', emptyDeck);
      }, {
        ...initialState,
        playersOnline: ['host', 'guest'],
        playersInLobby: ['host', 'guest'],
        userData: { host: { uid: 'hostId', displayName: 'hostName' } },
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
      }, 'Guest_guest was unable to join hostName\'s game.');
    });

    it('should be able to join an active game as a spectator', async () => {
      await expectStateFn(async (state: MSS) => {
        state.connectClient('host', dummyWebSocket);
        state.connectClient('guest', dummyWebSocket);
        state.connectClient('spectator', dummyWebSocket);
        state.setClientUserData('host', { uid: 'hostId', displayName: 'hostName' });
        await state.hostGame('host', 'My Game', 'normal', defaultDecks[0]);
        state.joinGame('guest', 'host', defaultDecks[1]);
        state.spectateGame('spectator', (state.lookupGameByClient('guest') as m.Game).id);
      }, (state: MSS) => ({
        ...initialState,
        games: [
          {
            ...state.lookupGameByClient('guest')!,
            spectators: ['spectator']
          }
        ],
        playersOnline: ['host', 'guest', 'spectator'],
        playersInLobby: [],
        userData: { host: { uid: 'hostId', displayName: 'hostName' } }
      }));
    });
  });

  describe('[Queuing]', () => {
    it('should be able to join the unranked queue', async () => {
      await expectState(async (state: MSS) => {
        state.connectClient('player', dummyWebSocket);
        state.setClientUserData('player', { uid: 'playerId', displayName: 'playerName' });
        state.joinQueue('player', 'normal', defaultDecks[0]);
      }, {
        ...initialState,
        playersOnline: ['player'],
        playersInLobby: ['player'],
        queueSize: 1,
        userData: { player: { uid: 'playerId', displayName: 'playerName' } }
      });
    });

    it('should NOT be able to join the unranked queue as a guest', async () => {
      await expectState(async (state: MSS) => {
        state.connectClient('player', dummyWebSocket);
        state.joinQueue('player', 'normal', defaultDecks[0]);
      }, {
        ...initialState,
        playersOnline: ['player'],
        playersInLobby: ['player']
      });
    });

    it('should NOT be able to join the unranked queue with an invalid deck', async () => {
      await expectState(async (state: MSS) => {
        state.connectClient('player', dummyWebSocket);
        state.joinQueue('player', 'normal', emptyDeck);
      }, {
        ...initialState,
        playersOnline: ['player'],
        playersInLobby: ['player']
      });
    });

    it('should be able to leave the unranked queue', async () => {
      await expectState(async (state: MSS) => {
        state.connectClient('player', dummyWebSocket);
        state.setClientUserData('player', { uid: 'playerId', displayName: 'playerName' });
        state.joinQueue('player', 'normal', defaultDecks[0]);
        state.leaveQueue('player');
      }, {
        ...initialState,
        playersOnline: ['player'],
        playersInLobby: ['player'],
        queueSize: 0,
        userData: { player: { uid: 'playerId', displayName: 'playerName' } }
      });
    });

    it('should be matched as soon as there is more than one player in the unranked queue for a given format', async () => {
      // TODO this behavior will change once there is "real" matchmaking.
      await expectStateFn(async (state: MSS) => {
        state.connectClient('player1', dummyWebSocket);
        state.setClientUserData('player1', { uid: 'playerId1', displayName: 'playerName1' });
        state.joinQueue('player1', 'normal', defaultDecks[0]);
        state.connectClient('player2', dummyWebSocket);
        state.setClientUserData('player2', { uid: 'playerId2', displayName: 'playerName2' });
        state.joinQueue('player2', 'normal', defaultDecks[1]);
        state.matchPlayersIfPossible();
      }, (state: MSS) => ({
        ...initialState,
        games: [
          {
            ...state.lookupGameByClient('player1') as m.Game,
            players: ['player2', 'player1']
          }
        ],
        playersOnline: ['player1', 'player2'],
        playersInLobby: [],
        queueSize: 0,
        userData: {
          player1: { uid: 'playerId1', displayName: 'playerName1' },
          player2: { uid: 'playerId2', displayName: 'playerName2' }
        }
      }));
    });

    it('should NOT be matched against a player in a different format', async () => {
      await expectState(async (state: MSS) => {
        state.connectClient('player1', dummyWebSocket);
        state.setClientUserData('player1', { uid: 'playerId1', displayName: 'playerName1' });
        state.joinQueue('player1', 'normal', defaultDecks[0]);
        state.connectClient('player2', dummyWebSocket);
        state.setClientUserData('player2', { uid: 'playerId2', displayName: 'playerName2' });
        state.joinQueue('player2', 'sharedDeck', defaultDecks[1]);
        state.matchPlayersIfPossible();
      }, {
        ...initialState,
        playersOnline: ['player1', 'player2'],
        playersInLobby: ['player1', 'player2'],
        queueSize: 2,
        userData: {
          player1: { uid: 'playerId1', displayName: 'playerName1' },
          player2: { uid: 'playerId2', displayName: 'playerName2' }
        }
      });
    });
  });

  describe('[Gameplay and game end]', () => {
    it('should store game actions and maintain a copy of game state', async () => {
      const state = new MultiplayerServerState();
      state.connectClient('player1', dummyWebSocket);
      state.connectClient('player2', dummyWebSocket);
      state.setClientUserData('player1', { uid: 'hostId', displayName: 'hostName' });
      await state.hostGame('player1', 'My Game', 'normal', defaultDecks[0]);
      state.joinGame('player2', 'player1', defaultDecks[1]);

      let game: m.Game = state.lookupGameByClient('player1')!;
      expect(game.actions).toEqual([]);
      expect([game.state.players.orange.hand.length, game.state.players.blue.hand.length]).toEqual([2, 2]);

      state.appendGameAction('player1', gameActions.passTurn('orange') as m.Action);
      state.appendGameAction('player2', gameActions.passTurn('blue') as m.Action);

      game = state.lookupGameByClient('player1')!;
      expect(game.actions).toEqual([
        { type: gameActions.PASS_TURN, payload: { player: 'orange' } },
        { type: gameActions.PASS_TURN, payload: { player: 'blue' } }
      ]);
      expect([game.state.players.orange.hand.length, game.state.players.blue.hand.length]).toEqual([3, 3]);
    });

    it('should detect endgame conditions', async () => {
      const state = new MultiplayerServerState();
      const storeGameResultFn: jest.Mock = jest.fn();
      state.storeGameResult = storeGameResultFn;

      state.connectClient('player1', dummyWebSocket);
      state.connectClient('player2', dummyWebSocket);
      state.setClientUserData('player1', { uid: 'hostId', displayName: 'hostName' });
      await state.hostGame('player1', 'My Game', 'normal', kernelKillerDeck);
      state.joinGame('player2', 'player1', defaultDecks[1]);
      state.appendGameAction('player1', gameActions.placeCard('3,-1,-2', 0) as m.Action);
      expect(storeGameResultFn.mock.calls.length).toBe(0);
      state.appendGameAction('player1', gameActions.passTurn('orange') as m.Action); // Orange wins on this turn.
      expect(storeGameResultFn.mock.calls.length).toBe(1);
    });

    it('should end the game if a player leaves the game', async () => {
      await expectState(async (state: MSS) => {
        const storeGameResultFn: jest.Mock = jest.fn();
        state.storeGameResult = storeGameResultFn;

        state.connectClient('player1', dummyWebSocket);
        state.connectClient('player2', dummyWebSocket);
        state.setClientUserData('player1', { uid: 'hostId', displayName: 'hostName' });
        await state.hostGame('player1', 'My Game', 'normal', defaultDecks[0]);
        state.joinGame('player2', 'player1', defaultDecks[1]);
        expect(storeGameResultFn.mock.calls.length).toBe(0);
        state.leaveGame('player2');
        expect(storeGameResultFn.mock.calls.length).toBe(1);
      }, {
        ...initialState,
        playersOnline: ['player1', 'player2'],
        playersInLobby: ['player1', 'player2'],
        userData: { player1: { uid: 'hostId', displayName: 'hostName' } }
      });
    });
  });

  describe('getCardsToReveal()', () => {
    async function startGame(player1Deck: m.Deck = defaultDecks[0], player2Deck: m.Deck = defaultDecks[0]): Promise<MSS> {
      const state = new MultiplayerServerState();

      state.connectClient('player1', dummyWebSocket);
      state.connectClient('player2', dummyWebSocket);
      state.connectClient('spectator', dummyWebSocket);
      state.setClientUserData('player1', { uid: 'hostId', displayName: 'hostName' });

      await state.hostGame('player1', 'My Game', 'normal', player1Deck);
      state.joinGame('player2', 'player1', player2Deck);
      state.spectateGame('spectator', (state.lookupGameByClient('player1') as m.Game).id);

      return state;
    }

    it('should only reveal cards in a player\'s hand to that player', async () => {
      const state = await startGame();
      // player1 is orange.
      expect(state.getCardsToReveal('player1').blue.hand.filter((c: m.Card) => c.id === 'obfuscated').length).toEqual(2);
      expect(state.getCardsToReveal('player1').orange.hand.filter((c: m.Card) => c.id !== 'obfuscated').length).toEqual(2);
      // player2 is blue.
      expect(state.getCardsToReveal('player2').blue.hand.filter((c: m.Card) => c.id !== 'obfuscated').length).toEqual(2);
      expect(state.getCardsToReveal('player2').orange.hand.filter((c: m.Card) => c.id === 'obfuscated').length).toEqual(2);
    });

    it('should not reveal any cards in hand to spectators', async () => {
      const state = await startGame();
      expect(state.getCardsToReveal('spectator').blue.hand.filter((c: m.Card) => c.id === 'obfuscated').length).toEqual(2);
      expect(state.getCardsToReveal('spectator').orange.hand.filter((c: m.Card) => c.id === 'obfuscated').length).toEqual(2);
    });

    it('should reveal robot cards when they are about to be played', async () => {
      const state = await startGame(botsOnlyDeck, botsOnlyDeck);
      const action: [m.Action, m.ClientID] = [gameActions.placeCard('3,-1,-2', 0) as m.Action, 'player1'];

      // player1 is orange.
      expect(state.getCardsToReveal('player1', action).blue.hand.filter((c: m.Card) => c.id === 'obfuscated').length).toEqual(2);
      expect(state.getCardsToReveal('player1', action).orange.hand.filter((c: m.Card) => c.id !== 'obfuscated').length).toEqual(2);
      // player2 is blue. Orange is playing a card, so that one card should be revealed.
      expect(state.getCardsToReveal('player2', action).blue.hand.filter((c: m.Card) => c.id !== 'obfuscated').length).toEqual(2);
      expect(state.getCardsToReveal('player2', action).orange.hand.filter((c: m.Card) => c.id !== 'obfuscated').length).toEqual(1);
      expect(state.getCardsToReveal('player2', action).orange.hand.filter((c: m.Card) => c.id === 'obfuscated').length).toEqual(1);
    });

    it('should reveal event cards when they are about to be played', async () => {
      const state = await startGame(eventsOnlyDeck, eventsOnlyDeck);
      state.appendGameAction('player1', gameActions.setSelectedCard(0, 'orange') as m.Action);
      const action: [m.Action, m.ClientID] = [gameActions.setSelectedTile('3,-1,-2', 'orange') as m.Action, 'player1'];

      // player1 is orange.
      expect(state.getCardsToReveal('player1', action).blue.hand.filter((c: m.Card) => c.id === 'obfuscated').length).toEqual(2);
      expect(state.getCardsToReveal('player1', action).orange.hand.filter((c: m.Card) => c.id !== 'obfuscated').length).toEqual(2);
      // player2 is blue. Orange is playing a card, so that one card should be revealed.
      expect(state.getCardsToReveal('player2', action).blue.hand.filter((c: m.Card) => c.id !== 'obfuscated').length).toEqual(2);
      expect(state.getCardsToReveal('player2', action).orange.hand.filter((c: m.Card) => c.id !== 'obfuscated').length).toEqual(1);
      expect(state.getCardsToReveal('player2', action).orange.hand.filter((c: m.Card) => c.id === 'obfuscated').length).toEqual(1);
    });

    it('should reveal cards in the discard pile to all clients', async () => {
      const state = await startGame(eventsOnlyDeck, eventsOnlyDeck);
      state.appendGameAction('player1', gameActions.setSelectedCard(0, 'orange') as m.Action);
      state.appendGameAction('player1', gameActions.setSelectedTile('3,-1,-2', 'orange') as m.Action);

      ['player1', 'player2', 'spectator'].forEach((clientID: m.ClientID) => {
        expect(state.getCardsToReveal(clientID).orange.discardPile.filter((c: m.Card) => c.id !== 'obfuscated').length).toEqual(1);
      });
    });
  });

  // TODO tests for card integrity verification?
});
