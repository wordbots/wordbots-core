/* eslint-disable no-console */
import * as w from '../../src/common/types';
import { allObjectsOnBoard, executeCmd } from '../../src/common/util/game';
import { getDefaultState } from '../testHelpers';

import actions from './100randomActions';

const oldConsoleWarn = console.warn;

// Sanity test that a sample of 100 random Wordbots ASTs (see Randomizer.scala), when converted to JavaScript,
// can all be executed without any crashes.
describe('Randomly generated actions', () => {
  beforeAll(() => {
    console.warn = (err: string) => { throw err; };
  });

  it('should be executable without crashing', () => {
    let numSuccessful = 0;

    actions.forEach((action) => {
      try {
        const state = getDefaultState();
        const currentObj: w.Object = Object.values(allObjectsOnBoard(state))[0];

        const currentObjTarget: w.ObjectCollection = { type: 'objects', entries: [currentObj] };
        // console.log(action);
        executeCmd({...state, memory: { target: currentObjTarget }}, action, currentObj);
        numSuccessful++;
      } catch (error) {
        console.log(action);
        console.error(error);
        // throw error;
      }
    });

    expect(numSuccessful).toEqual(actions.length);
  });

  afterAll(() => {
    console.warn = oldConsoleWarn;
  });
});
