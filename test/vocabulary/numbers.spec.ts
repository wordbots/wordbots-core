import * as cards from '../../src/common/store/cards';
import { action, getDefaultState, newTurn, playEvent, playObject, startingHandSize } from '../testHelpers';

describe('[vocabulary.numbers]', () => {
  it('count', () => {
    let state = getDefaultState();
    state = playObject(state, 'orange', cards.oneBotCard, '3,-1,-2');
    state = playObject(state, 'orange', cards.oneBotCard, '2,1,-3');
    state = playEvent(state, 'orange', cards.wisdomCard);  // "Draw a card equal to the number of robots you control."
    expect(state.players.orange.hand.length).toEqual(startingHandSize + 2);
  });

  it('energyAmount', () => {
    let state = getDefaultState();
    state = playEvent(state, 'orange', action("Draw cards equal to your energy.", "(function () { actions['draw'](targets['self'](), energyAmount(targets['self']())); })"));
    expect(state.players.orange.hand.length).toEqual(startingHandSize + 1);
  });

  it('maximumEnergyAmount', () => {
    let state = getDefaultState();
    state = newTurn(state, 'orange');
    state.players.orange.energy.available = 1;  // Orange player now has 1/2 energy
    const handSize = state.players.orange.hand.length;
    state = playEvent(state, 'orange', action("Draw cards equal to your maximum energy.", "(function () { actions['draw'](targets['self'](), maximumEnergyAmount(targets['self']())); })"));
    expect(state.players.orange.hand.length).toEqual(handSize + 2);
  });
});
