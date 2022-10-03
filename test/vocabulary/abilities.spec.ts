import { times } from 'lodash';

import { allObjectsOnBoard, hasEffect } from '../../src/common/util/game';
import * as cards from '../../src/common/store/cards';
import * as testCards from '../data/cards';
import { getDefaultState, moveRobot, newTurn, playObject, setUpBoardState } from '../testHelpers';

describe('[vocabulary.abilities]', () => {
  it('Abilities unapply when targets no longer meet conditions', () => {
    let state = setUpBoardState({
      'orange': { '3,-1,-2': cards.defenderBotCard }, // Defender Bot has Taunt
      'blue': { '1,0,-1': cards.oneBotCard }
    });
    state = newTurn(state, 'blue');

    // Taunt doesn't currently apply to One Bot because it's not adjacent to Defender Bot
    expect(hasEffect(allObjectsOnBoard(state)['1,0,-1'], 'canonlyattack')).toBe(false);

    // Move One Bot adjacent to Defender Bot – it should have the Taunt effect applied to it.
    state = moveRobot(state, '1,0,-1', '2,0,-2');
    expect(hasEffect(allObjectsOnBoard(state)['2,0,-2'], 'canonlyattack')).toBe(true);

    // Move One Bot back away from Defender Bot – it should have the Taunt effect unapplied from it.
    state = moveRobot(state, '2,0,-2', '1,0,-1');
    expect(hasEffect(allObjectsOnBoard(state)['1,0,-1'], 'canonlyattack')).toBe(false);
  });

  it('conditionalAction', () => {
    let state = getDefaultState();
    // Countdown Clock:
    // At the start of your turn, give this object 1 health.
    // When this object has 15 or more health, you win the game.
    state = playObject(state, 'orange', testCards.countdownClockCard, '3,-1,-2');

    times(13, () => { state = newTurn(state, 'orange'); });
    // Countdown Clock has 14 health.
    expect(state.winner).toBeNull();

    state = newTurn(state, 'orange');
    // Countdown Clock has 15 health.
    expect(state.winner).toEqual('orange');
  });
});
