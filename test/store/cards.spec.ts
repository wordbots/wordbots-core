import { TYPE_ROBOT } from '../../src/common/constants';
import { collection } from '../../src/common/store/cards';
import * as w from '../../src/common/types';
import { executeCmd } from '../../src/common/util/game';
import { getDefaultState } from '../testHelpers';

const oldConsoleWarn = console.warn;

describe('Built-in cards', () => {
  beforeAll(() => {
    console.warn = (err: string) => { throw err; };
  });

  it('should be playable without crashing', () => {
    const state = getDefaultState();

    const dummyCurrentObj: w.Object = {
      id: 'orangeCore',  // (Object id that is guaranteed to exist.)
      type: TYPE_ROBOT,
      card: {
        metadata: { source: { type: 'builtin' } as w.CardSource },
        integrity: [],
        id: 'Test',
        name: 'Test',
        type: TYPE_ROBOT,
        baseCost: 0,
        cost: 0
      },
      stats: { attack: 1, health: 1, speed: 1 },
      abilities: new Array<w.PassiveAbility>(),
      triggers: new Array<w.TriggeredAbility>(),
      effects: [],
      movesMade: 0
    };

    collection.forEach((card) => {
      try {
        const abilities = (card.abilities || []).concat(card.command || []);
        abilities.forEach((ability) => {
          executeCmd(state, ability, dummyCurrentObj);

          // Try executing all triggers.
          dummyCurrentObj.triggers.forEach((trigger) => {
            executeCmd({ ...state, that: dummyCurrentObj }, trigger.action, dummyCurrentObj);
          });

          // And reset the dummy object.
          dummyCurrentObj.abilities = [];
          dummyCurrentObj.triggers = [];
        });
      } catch (error) {
        console.error(`Error executing ability for ${card.name} card!`);
        throw error;
      }
    });
  });

  afterAll(() => {
    console.warn = oldConsoleWarn;
  });
});
