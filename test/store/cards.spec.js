import { collection } from '../../src/common/store/cards';
import { executeCmd } from '../../src/common/util/game';
import { getDefaultState } from '../testHelpers';

describe('Built-in cards', () => {
  it('should be playable without crashing', () => {
    const state = getDefaultState();

    const dummyCurrentObj = {
      id: 'orangeCore',  // (Object id that is guaranteed to exist.)
      stats: { attack: 1, health: 1, speed: 1 },
      abilities: [],
      triggers: []
    };

    collection.forEach(card => {
      try {
        const abilities = (card.abilities || []).concat(card.command || []);
        abilities.forEach(ability => {
          executeCmd(state, ability, dummyCurrentObj);
        });
      } catch (err) {
        console.error(`Error executing ability for ${card.name} card!`);  // eslint-disable-line no-console
        throw err;
      }
    });
  });
});
