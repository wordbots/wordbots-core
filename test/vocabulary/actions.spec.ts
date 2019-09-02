import { size } from 'lodash';

import { STARTING_PLAYER_HEALTH, TYPE_ROBOT } from '../../src/common/constants';
import * as cards from '../../src/common/store/cards';
import { allObjectsOnBoard } from '../../src/common/util/game';
import * as testCards from '../data/cards';
import {
  attack, event, getDefaultState, objectsOnBoardOfType,
  playEvent, playObject, queryPlayerHealth, queryRobotAttributes, setUpBoardState, startingHandSize
} from '../testHelpers';

describe('[vocabulary.actions]', () => {
  it('canAttackAgain', () => {
    let state = setUpBoardState({
      orange: { '0,0,0': cards.twoBotCard },
      blue: { '-1,0,1': cards.twoBotCard }
    });

    state = attack(state, '0,0,0', '-1,0,1', true);  // Both Two Bots should now be down to 4-2=2 health.
    expect(size(objectsOnBoardOfType(state, TYPE_ROBOT))).toEqual(2);
    state = playEvent(state, 'orange', event("All robots can attack again.", "(function () { actions['canAttackAgain'](objectsMatchingConditions('robot', [])); })"));
    state = attack(state, '0,0,0', '-1,0,1');  // Both Two Bots should now be destroyed.
    expect(size(objectsOnBoardOfType(state, TYPE_ROBOT))).toEqual(0);
  });

  it('giveAbility', () => {
    let state = setUpBoardState({
      orange: { '0,0,0': cards.twoBotCard },
      blue: { '-1,0,1': cards.twoBotCard }
    });

    state = playEvent(state, 'blue', cards.missileStrikeCard);  // "Deal 5 damage to your opponent."
    expect(queryPlayerHealth(state, 'orange')).toEqual(STARTING_PLAYER_HEALTH - 4);

    state = playEvent(state, 'orange', cards.vampirePotionCard, { hex: '0,0,0' });  // 'Give a robot "When this robot attacks, restore 3 health to your kernel"'
    state = attack(state, '0,0,0', '-1,0,1', true);
    expect(queryPlayerHealth(state, 'orange')).toEqual(STARTING_PLAYER_HEALTH - 4 + 3);
  });

  it("forEach", () => {
    let state = getDefaultState();
    state = playObject(state, 'orange', cards.oneBotCard, '3,-1,-2');
    state = playObject(state, 'orange', cards.oneBotCard, '2,1,-3');
    state = playEvent(state, 'orange', event("Deal 3 damage to your kernel for each robot in play", "(function () { actions['forEach'](objectsMatchingConditions('robot', []), (function () { actions['dealDamage'](objectsMatchingConditions('kernel', [conditions['controlledBy'](targets['self']())]), 3); })); })"));
    expect(queryPlayerHealth(state, 'orange')).toEqual(STARTING_PLAYER_HEALTH - 6);
  });

  it('moveCardsToHand', () => {
    let state = getDefaultState();

    state = playEvent(state, 'orange', event("Move all cards from your discard pile to your hand", "(function () { actions['moveCardsToHand'](targets['all'](cardsInDiscardPile(targets['self'](), 'anycard', [])), targets['self']()); })"));
    expect(state.players.orange.hand.length).toEqual(startingHandSize);
    expect(state.players.orange.discardPile.length).toEqual(1);

    // Let's also test filtering on cardsInDiscardPile while we're at it ...
    state = playEvent(state, 'orange', event("Move all event cards from your discard pile that costs 0 or more energy to your hand", "(function () { actions['moveCardsToHand'](targets['all'](cardsInDiscardPile(targets['self'](), 'event', [conditions['attributeComparison']('cost', (function (x) { return x >= 0; }))])), targets['self']()); })"));
    expect(state.players.orange.hand.length).toEqual(startingHandSize + 1);
    expect(state.players.orange.discardPile.length).toEqual(1);
  });

  it('removeAllAbilities', () => {
    let state = getDefaultState();
    state = playObject(state, 'orange', cards.hermesCard, '3,-1,-2');
    expect(allObjectsOnBoard(state)['3,-1,-2'].abilities.length).toEqual(1);
    state = playEvent(state, 'orange', cards.greatSimplificationCard);  // "Remove all abilities from all robots."
    expect(allObjectsOnBoard(state)['3,-1,-2'].abilities.length).toEqual(0);
  });

  it('restoreHealth', () => {
    let state = getDefaultState();
    state = playObject(state, 'orange', cards.blueBotCard, '3,-1,-2');  // 2/8/1
    state = playEvent(state, 'orange', cards.shockCard, { hex: '3,-1,-2' });  // deal 3 damage
    expect(queryRobotAttributes(state, '3,-1,-2')).toEqual('2/5/1');

    state = playEvent(
      state, 'orange',
      event("Restore 1 health to a robot", "(function () { actions['restoreHealth'](targets['choose'](objectsMatchingConditions('robot', [])), 1); })"),
      { hex: '3,-1,-2' }
    );
    expect(queryRobotAttributes(state, '3,-1,-2')).toEqual('2/6/1');

    state = playEvent(state, 'orange', event("Restore all robots' health", "(function () { actions['restoreHealth'](objectsMatchingConditions('robot', [])); })"));
    expect(queryRobotAttributes(state, '3,-1,-2')).toEqual('2/8/1');
  });

  it('returnToHand', () => {
    let state = getDefaultState();
    state = playObject(state, 'orange', testCards.attackBotCard, '3,-1,-2');
    state = playEvent(
      state, 'orange',
      event("Return a robot to its owner's hand", "(function () { actions['returnToHand'](targets['choose'](objectsMatchingConditions('robot', []))); })"),
      { hex: '3,-1,-2' }
    );
    expect(objectsOnBoardOfType(state, TYPE_ROBOT)).toEqual({});
    expect(state.players.orange.hand.length).toEqual(startingHandSize + 1);
  });

  it('shuffleCardsIntoDeck', () => {
    let state = getDefaultState();

    state = playEvent(state, 'orange', event("Shuffle all cards from your discard pile into your deck", "(function () { actions['shuffleCardsIntoDeck'](targets['all'](cardsInDiscardPile(targets['self'](), 'anycard', [])), targets['self']()); })"));
    expect(state.players.orange.deck.length).toEqual(getDefaultState().players.orange.deck.length);
    expect(state.players.orange.discardPile.length).toEqual(1);

    state = playEvent(state, 'orange', event("Shuffle all cards from your discard pile into your deck", "(function () { actions['shuffleCardsIntoDeck'](targets['all'](cardsInDiscardPile(targets['self'](), 'anycard', [])), targets['self']()); })"));
    expect(state.players.orange.deck.length).toEqual(getDefaultState().players.orange.deck.length + 1);
    expect(state.players.orange.discardPile.length).toEqual(1);

    // "the 0 or more energy" part is unnecessary but lets us test out applying conditions to cardsInHand()
    state = playEvent(state, 'orange', event("Shuffle all cards from your hand that costs 0 or more energy into your deck", "(function () { actions['shuffleCardsIntoDeck'](targets['all'](cardsInHand(targets['self'](), 'anycard', [conditions['attributeComparison']('cost', (function (x) { return x >= 0; }))])), targets['self']()); })"));
    expect(state.players.orange.deck.length).toEqual(getDefaultState().players.orange.deck.length + 1 + startingHandSize);
  });

  it('spawnObject (inline)', () => {
    let state = getDefaultState();
    state = playEvent(state, 'orange', testCards.reinforcementsCard);
    expect(
      objectsOnBoardOfType(state, TYPE_ROBOT)
    ).toEqual({
      '2,0,-2': 'Reinforcements',
      '2,1,-3': 'Reinforcements',
      '3,-1,-2': 'Reinforcements'
    });
  });

  it('spawnObject (from discard pile)', () => {
    let state = getDefaultState();
    state = playObject(state, 'orange', testCards.attackBotCard, '3,-1,-2');
    state = playEvent(state, 'orange', testCards.wrathOfRobotGodCard);  // "Destroy all robots."
    expect(objectsOnBoardOfType(state, TYPE_ROBOT)).toEqual({});
    expect(state.players.orange.discardPile.filter((c) => c.type === TYPE_ROBOT).length).toEqual(1);
    state = playEvent(state, 'orange', event("Play a random robot from your discard pile on a random tile adjacent to your kernel.", "(function () { actions['spawnObject'](targets['random'](1, cardsInDiscardPile(targets['self'](), 'robot', [])), targets['random'](1, tilesMatchingConditions([conditions['adjacentTo'](objectsMatchingConditions('kernel', [conditions['controlledBy'](targets['self']())]))])), targets['self']()); })"));
    expect(Object.values(objectsOnBoardOfType(state, TYPE_ROBOT))).toEqual(["Attack Bot"]);
    expect(state.players.orange.discardPile.filter((c) => c.type === TYPE_ROBOT).length).toEqual(0);
  });

  it('swapAttributes', () => {
    let state = getDefaultState();
    state = playObject(state, 'orange', cards.blueBotCard, '3,-1,-2');  // 2/8/1
    state = playEvent(state, 'orange', event("Swap all robots' attack and health.", "(function () { actions['swapAttributes'](objectsMatchingConditions('robot', []), 'attack', 'health'); })"));
    expect(queryRobotAttributes(state, '3,-1,-2')).toEqual('8/2/1');
  });
});
