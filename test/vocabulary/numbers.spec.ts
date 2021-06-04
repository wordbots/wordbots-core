import * as cards from '../../src/common/store/cards';
import * as testCards from '../data/cards';
import { action, attack, getDefaultState, newTurn, playEvent, playObject, queryRobotAttributes, setUpBoardState, startingHandSize } from '../testHelpers';

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

  it('thatMuch', () => {
    let state = setUpBoardState({
      // Rage: 'Whenever a robot takes damage, it gains that much attack.'
      orange: { '3,-1,-2': testCards.rageCard, '0,0,0': cards.twoBotCard },  // two bot: 2/4/1
      blue: { '-1,0,1': cards.oneBotCard }  // one bot: 1/2/2
    });
    state = attack(state, '0,0,0', '-1,0,1', true);  // Two Bot should destroy the One Bot and move to -1,0,1, taking 1 damage and gaining +1 attack in the process.
    expect(queryRobotAttributes(state, '-1,0,1')).toEqual('3/3/1');
  });
});
