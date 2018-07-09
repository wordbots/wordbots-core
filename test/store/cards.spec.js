import { collection } from '../../src/common/store/cards.ts';
import { executeCmd } from '../../src/common/util/game';
import { getDefaultState } from '../testHelpers';

/* eslint-disable no-console */
const oldConsoleWarn = console.warn;

describe('Built-in cards', () => {
  beforeAll(() => {
    console.warn = (err) => { throw err; };
  });

  it('should be playable without crashing', () => {
    const state = getDefaultState();

    const dummyCurrentObj = {
      id: 'orangeCore',  // (Object id that is guaranteed to exist.)
      card: { name: 'Test' },
      stats: { attack: 1, health: 1, speed: 1 },
      abilities: [],
      triggers: []
    };

    collection.forEach(card => {
      try {
        const abilities = (card.abilities || []).concat(card.command || []);
        abilities.forEach(ability => {
          executeCmd(state, ability, dummyCurrentObj);

          // Try executing all triggers.
          dummyCurrentObj.triggers.forEach(trigger => {
            executeCmd({...state, that: dummyCurrentObj}, trigger.action, dummyCurrentObj);
          });

          // And reset the dummy object.
          dummyCurrentObj.abilities = [];
          dummyCurrentObj.triggers = [];
        });
      } catch (err) {
        console.error(`Error executing ability for ${card.name} card!`);
        throw err;
      }
    });
  });

  afterAll(() => {
    console.warn = oldConsoleWarn;
  });
});
