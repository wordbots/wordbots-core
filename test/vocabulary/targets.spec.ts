import * as actions from '../../src/common/actions/game';
import { DECK_SIZE, ORANGE_CORE_HEX, STARTING_PLAYER_HEALTH, TYPE_ROBOT } from '../../src/common/constants';
import game from '../../src/common/reducers/game';
import * as cards from '../../src/common/store/cards';
import { action, getDefaultState, objectsOnBoardOfType, playEvent, playObject, queryObjectAttribute, setUpBoardState } from '../testHelpers';
import * as testCards from '../data/cards';

describe('[vocabulary.targets]', () => {
  describe('choose', () => {
    // NOTE: There are many more cases in targets.choose().
    //       The below are cases that aren't handled in other tests.

    it('can choose a card in a discard pile', () => {
      let state = getDefaultState();
      state = playEvent(state, 'orange', cards.superchargeCard);
      const superchargeCardId = state.players.orange.discardPile[0].id;

      const returnCardToHandCard = action('Return a card in your discard pile to your hand', "(function () { actions['moveCardsToHand'](targets['choose'](cardsInDiscardPile(targets['self'](), 'anycard', [])), targets['self']()); })");
      state = playEvent(state, 'orange', returnCardToHandCard, []);
      state = game(state, actions.setSelectedCardInDiscardPile(superchargeCardId, 'orange'));
      expect(state.players.orange.discardPile.map((card) => card.name)).toEqual([returnCardToHandCard.name]);
      expect(state.players.orange.hand.map((card) => card.id)).toContain(superchargeCardId);
    });
  });

  describe('that', () => {
    // TODO: "Whenever this robot attacks a robot, destroy that robot."

    it('handles situations where a targeted object no longer exists', () => {
      let state = getDefaultState();
      state = playObject(state, 'orange', cards.oneBotCard, '3,-1,-2');
      state = playObject(state, 'orange', cards.oneBotCard, '2,-1,-3');

      const fragGrenadeCard = action(
        'Deal 3 damage to a robot, then deal 3 damage to all robots adjacent to that robot.',
        "(function () { (function () { actions['dealDamage'](targets['choose'](objectsMatchingConditions('robot', [])), 3); })(); (function () { actions['dealDamage'](objectsMatchingConditions('robot', [conditions['adjacentTo'](targets['that']())]), 3); })(); })"
      );
      state = playEvent(state, 'blue', fragGrenadeCard, [{ hex: '3,-1,-2' }]);
      expect(objectsOnBoardOfType(state, TYPE_ROBOT)).toEqual({});
    });
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
        action("Set a robot's attack equal to their health", "(function () { actions['setAttribute'](targets['choose'](objectsMatchingConditions('robot', [])), 'attack', \"(function () { return attributeValue(targets['they'](), 'health'); })\"); })"),
        { hex: '0,0,0' }
      );
      expect(queryObjectAttribute(state, '0,0,0', 'attack')).toEqual(2);
      expect(queryObjectAttribute(state, '0,-1,1', 'attack')).toEqual(1);
    });
  });

  describe('theyP', () => {
    it('handles iterating over players', () => {
      let state = getDefaultState();
      state = playEvent(state, 'orange', action('Each player shuffles all cards from their hand into their deck', "(function () { actions['forEach'](targets['allPlayers'](), (function () { actions['shuffleCardsIntoDeck'](targets['all'](cardsInHand(targets['theyP'](), 'anycard', [])), targets['theyP']()); })); })"));
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
      state = playEvent(state, 'blue', action('Your opponent returns a random robot from their discard pile to a random tile', "(function () { actions['spawnObject'](targets['random'](1, cardsInDiscardPile(targets['theyP'](), 'robot', [])), targets['random'](1, allTiles()), targets['opponent']()); })"));
      expect(state.players.orange.discardPile.length).toEqual(0);
      expect(
        Object.values(state.players.orange.objectsOnBoard).filter((o) => o.type === TYPE_ROBOT).map((o) => o.card.name)
      ).toEqual(['One Bot']);
    });
  });

  describe('thisRobot', () => {
    it('falls back to `it` when there is no currentObject', () => {
      let state = getDefaultState();
      state = playObject(state, 'orange', cards.oneBotCard, '3,-1,-2');
      state = playObject(state, 'orange', cards.oneBotCard, '2,-1,-3');

      const fragGrenadeAltCard = action(
        "Deal 3 damage to a robot and all adjacent robots",
        "(function () { actions['dealDamage'](targets['union']([ targets['choose'](objectsMatchingConditions('robot', [])), objectsMatchingConditions('robot', [conditions['adjacentTo'](targets['thisRobot']())]) ]), 3); })"
      );
      state = playEvent(state, 'blue', fragGrenadeAltCard, [{ hex: '3,-1,-2' }]);
      expect(objectsOnBoardOfType(state, TYPE_ROBOT)).toEqual({});
    });

    it('preserves currentObject having the highest salience even for triggered abilities', () => {
      // RATIONALE:
      // Triggered abilities should set `it` to higher salience than `currentObject` for targets['it'] but NOT for targets['this'].
      // So for:
      //      Arena: Whenever a robot is destroyed in combat, deal 1 damage to its controller.
      //      it = destroyed robot  (it > currentObject for 'it')
      // but for:
      //      Glass Hammer: Whenever your kernel takes damage, destroy this robot.
      //      this = this robot     (currentObject > it for 'this')

      let state = getDefaultState();
      state = playObject(state, 'orange', testCards.glassHammerCard, '3,-1,-2');  // "Whenever your kernel takes damage, destroy this robot."
      state = playEvent(state, 'blue', cards.missileStrikeCard);  // "Deal 4 damage to your opponent."

      // Glass Hammer should be destroyed, NOT the orange kernel!
      expect(objectsOnBoardOfType(state, TYPE_ROBOT)).toEqual({});
      expect(queryObjectAttribute(state, ORANGE_CORE_HEX, 'health')).toEqual(STARTING_PLAYER_HEALTH - 4);
    });
  });
});
