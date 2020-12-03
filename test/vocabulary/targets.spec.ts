import * as actions from '../../src/common/actions/game';
import { DECK_SIZE, TYPE_ROBOT } from '../../src/common/constants';
import game from '../../src/common/reducers/game';
import * as cards from '../../src/common/store/cards';
import { event, getDefaultState, objectsOnBoardOfType, playEvent, playObject, queryObjectAttribute, setUpBoardState } from '../testHelpers';

describe('[vocabulary.targets]', () => {
  describe('choose', () => {
    // NOTE: There are many more cases in targets.choose().
    //       The below are cases that aren't handled in other tests.

    it('can choose a card in a discard pile', () => {
      let state = getDefaultState();
      state = playEvent(state, 'orange', cards.superchargeCard);
      const superchargeCardId = state.players.orange.discardPile[0].id;

      const returnCardToHandCard = event('Return a card in your discard pile to your hand', '(function () { actions[\'moveCardsToHand\'](targets[\'choose\'](cardsInDiscardPile(targets[\'self\'](), \'anycard\', [])), targets[\'self\']()); })');
      state = playEvent(state, 'orange', returnCardToHandCard, []);
      state = game(state, actions.setSelectedCardInDiscardPile(superchargeCardId, 'orange'));
      expect(state.players.orange.discardPile.map((card) => card.name)).toEqual([returnCardToHandCard.name]);
      expect(state.players.orange.hand.map((card) => card.id)).toContain(superchargeCardId);
    });
  });

  // eslint-disable-next-line lodash/prefer-noop
  xdescribe('that', () => {
    // TODO: "Whenever this robot attacks a robot, destroy that robot."
  });

  describe('they', () => {
    const initialStateSetup = {
      orange: { '0,0,0': cards.oneBotCard },  // 1/2/2
      blue: { '0,-1,1': cards.oneBotCard }  // 1/2/2
    };

    it('handles iterating over objects', () => {
      let state = setUpBoardState(initialStateSetup);
      state = playEvent(state, 'orange', cards.equalizeCard); // "Set the attack of all robots to their health."
      expect(queryObjectAttribute(state, '0,0,0', 'attack')).toEqual(2);
      expect(queryObjectAttribute(state, '0,-1,1', 'attack')).toEqual(2);
    });

    it('handle case where there\'s nothing to iterate over', () => {
      let state = setUpBoardState(initialStateSetup);
      state = playEvent(state, 'orange',
        event('Set a robot\'s attack equal to their health', '(function () { actions[\'setAttribute\'](targets[\'choose\'](objectsMatchingConditions(\'robot\', [])), \'attack\', "(function () { return attributeValue(targets[\'they\'](), \'health\'); })"); })'),
        { hex: '0,0,0' }
      );
      expect(queryObjectAttribute(state, '0,0,0', 'attack')).toEqual(2);
      expect(queryObjectAttribute(state, '0,-1,1', 'attack')).toEqual(1);
    });
  });

  describe('theyP', () => {
    it('handles iterating over players', () => {
      let state = getDefaultState();
      state = playEvent(state, 'orange', event('Each player shuffles all cards from their hand into their deck', '(function () { actions[\'forEach\'](targets[\'allPlayers\'](), (function () { actions[\'shuffleCardsIntoDeck\'](targets[\'all\'](cardsInHand(targets[\'theyP\'](), \'anycard\', [])), targets[\'theyP\']()); })); })'));
      expect(state.players.orange.hand.length).toEqual(0);
      expect(state.players.blue.hand.length).toEqual(0);
      expect(state.players.orange.deck.length).toEqual(DECK_SIZE);
      expect(state.players.blue.deck.length).toEqual(DECK_SIZE);
    });

    it('falls back to itP when not iterating over players', () => {
      let state = getDefaultState();
      state = playObject(state, 'orange', cards.oneBotCard, '3,-1,-2');
      state = playEvent(state, 'blue', cards.shockCard, { hex: '3,-1,-2' });
      expect(objectsOnBoardOfType(state, TYPE_ROBOT)).toEqual({});
      state = playEvent(state, 'blue', event('Your opponent returns a random robot from their discard pile to a random tile', '(function () { actions[\'spawnObject\'](targets[\'random\'](1, cardsInDiscardPile(targets[\'theyP\'](), \'robot\', [])), targets[\'random\'](1, allTiles()), targets[\'opponent\']()); })'));
      expect(state.players.orange.discardPile.length).toEqual(0);
      expect(
        Object.values(state.players.orange.robotsOnBoard).filter((o) => o.type === TYPE_ROBOT).map((o) => o.card.name)
      ).toEqual(['One Bot']);
    });
  });
});
