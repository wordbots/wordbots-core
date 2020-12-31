import { times } from 'lodash';

import * as testCards from '../data/cards';
import { getDefaultState, newTurn, playObject } from '../testHelpers';

describe('[vocabulary.abilities]', () => {
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
