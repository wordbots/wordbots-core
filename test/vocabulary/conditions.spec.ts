import { STARTING_PLAYER_HEALTH, TYPE_ROBOT } from '../../src/common/constants';
import * as cards from '../../src/common/store/cards';
import * as testCards from '../data/cards';
import { attack, event, getDefaultState, moveRobot, newTurn, objectsOnBoardOfType, playEvent, playObject, queryObjectAttribute, queryPlayerHealth, setUpBoardState } from '../testHelpers';

describe('[vocabulary.conditions]', () => {
  describe('[properties]', () => {
    // eslint-disable-next-line  
    const initialStateSetup = {
      orange: {
        '0,0,0': cards.oneBotCard,
        '0,-2,2': cards.oneBotCard
      },
      blue: {
        '0,-1,1': cards.oneBotCard
      }
    };

    it('attackedlastturn', () => {
      let state = setUpBoardState(initialStateSetup);
      state = attack(state, '0,0,0', '0,-1,1', true);
      state = newTurn(state, 'blue');
      state = playEvent(state, 'blue', event('Deal 1 damage to each robot that attacked last turn', '(function () { actions[\'dealDamage\'](objectsMatchingConditions(\'robot\', [conditions[\'hasProperty\'](\'attackedlastturn\')]), 1); })'));
       // The robot at 0,0,0 should be destroyed now.
      expect(Object.keys(objectsOnBoardOfType(state, TYPE_ROBOT)).sort()).toEqual(['0,-2,2', '0,-1,1'].sort());
    });

    it('attackedthisturn', () => {
      let state = setUpBoardState(initialStateSetup);
      state = attack(state, '0,0,0', '0,-1,1', true);
      state = playEvent(state, 'orange', event('Deal 1 damage to each robot that attacked this turn', '(function () { actions[\'dealDamage\'](objectsMatchingConditions(\'robot\', [conditions[\'hasProperty\'](\'attackedthisturn\')]), 1); })'));
       // The robot at 0,0,0 should be destroyed now.
      expect(Object.keys(objectsOnBoardOfType(state, TYPE_ROBOT)).sort()).toEqual(['0,-2,2', '0,-1,1'].sort());
    });

    it('isdestroyed', () => {
      let state = setUpBoardState(initialStateSetup);
      const card = event('Deal 2 damage to a robot. If that robot is destroyed, gain 2 life', [
        '(function () { actions[\'dealDamage\'](targets[\'choose\'](objectsMatchingConditions(\'robot\', [])), 2); })',
        '(function () { if (globalConditions[\'targetHasProperty\'](targets[\'that\'](), \'isdestroyed\')) { ((function () { actions[\'modifyAttribute\'](objectsMatchingConditions(\'kernel\', [conditions[\'controlledBy\'](targets[\'self\']())]), \'health\', function (x) { return x + 2; }); }))(); } })'
      ]);
      state = playEvent(state, 'orange', card, { hex: '0,-1,1' });
      expect(Object.keys(objectsOnBoardOfType(state, TYPE_ROBOT)).sort()).toEqual(['0,0,0', '0,-2,2'].sort());
      expect(queryPlayerHealth(state, 'orange')).toEqual(STARTING_PLAYER_HEALTH + 2);
    });

    it('movedlastturn', () => {
      let state = setUpBoardState(initialStateSetup);
      state = moveRobot(state, '0,0,0', '0,1,-1', true);
      state = newTurn(state, 'blue');
      state = playEvent(state, 'blue', event('Deal 2 damage to each robot that attacked last turn', '(function () { actions[\'dealDamage\'](objectsMatchingConditions(\'robot\', [conditions[\'hasProperty\'](\'movedlastturn\')]), 2); })'));
       // The robot at 0,0,0 should be destroyed now.
      expect(Object.keys(objectsOnBoardOfType(state, TYPE_ROBOT)).sort()).toEqual(['0,-2,2', '0,-1,1'].sort());
    });

    it('movedthisturn', () => {
      let state = setUpBoardState(initialStateSetup);
      state = moveRobot(state, '0,0,0', '0,1,-1', true);
      state = playEvent(state, 'orange', event('Deal 2 damage to each robot that attacked this turn', '(function () { actions[\'dealDamage\'](objectsMatchingConditions(\'robot\', [conditions[\'hasProperty\'](\'movedthisturn\')]), 2); })'));
       // The robot at 0,0,0 should be destroyed now.
      expect(Object.keys(objectsOnBoardOfType(state, TYPE_ROBOT)).sort()).toEqual(['0,-2,2', '0,-1,1'].sort());
    });

    it('isdamaged', () => {
      let state = setUpBoardState(initialStateSetup);
      state = attack(state, '0,0,0', '0,-1,1', true);
      state = newTurn(state, 'blue');
      state = playEvent(state, 'blue', event('Deal 1 damage to each damaged robot', '(function () { actions[\'dealDamage\'](objectsMatchingConditions(\'robot\', [conditions[\'hasProperty\'](\'isdamaged\')]), 1); })'));
       // The robots at 0,0,0 and 0,-1,1 should be destroyed now.
      expect(Object.keys(objectsOnBoardOfType(state, TYPE_ROBOT)).sort()).toEqual(['0,-2,2'].sort());
    });
  });

  it('conditions.attributeComparison', () => {
    let state = getDefaultState();
    state = playObject(state, 'orange', cards.oneBotCard, '3,-1,-2');  // 2 speed
    state = playObject(state, 'orange', cards.blueBotCard, '2,1,-3');  // 1 speed
    state = playEvent(state, 'orange', cards.earthquakeCard);  // "Destroy all robots that have less than 2 speed."
    expect(Object.values(objectsOnBoardOfType(state, TYPE_ROBOT))).toEqual(['One Bot']);
  });

  it('globalConditions.collectionCountComparison', () => {
    let state = getDefaultState();
    state = playObject(state, 'orange', testCards.thresholderCard, '3,-1,-2');  // 1/1/1, "This robot has +4 attack if your discard pile has 5 or more cards"
    expect(queryObjectAttribute(state, '3,-1,-2', 'attack')).toEqual(1);
    state = playEvent(state, 'orange', testCards.cantripCard);
    state = playEvent(state, 'orange', testCards.cantripCard);
    state = playEvent(state, 'orange', testCards.cantripCard);
    state = playEvent(state, 'orange', testCards.cantripCard);
    expect(queryObjectAttribute(state, '3,-1,-2', 'attack')).toEqual(1);
    state = playEvent(state, 'orange', testCards.cantripCard);
    expect(queryObjectAttribute(state, '3,-1,-2', 'attack')).toEqual(5);
  });

  it('globalConditions.collectionExists', () => {
    let state = setUpBoardState({
      orange: {
        '0,0,0': cards.oneBotCard
      },
      blue: {
        '0,-1,1': cards.energyWellCard  // "At the start of each player's turn, that player gains 1 energy if they control an adjacent robot."
      }
    });

    state = newTurn(state, 'orange');
    expect(state.players.orange.energy.available).toEqual(state.players.orange.energy.total + 1);

    state = newTurn(state, 'blue');
    expect(state.players.blue.energy.available).toEqual(state.players.blue.energy.total);

    state = playEvent(state, 'blue', cards.shockCard, { hex: '0,0,0' });  // Destroy the orange One Bot at 0,0,0.
    state = newTurn(state, 'orange');
    expect(state.players.orange.energy.available).toEqual(state.players.orange.energy.total);
  });
});
