import { isArray, noop } from 'lodash';

import { collection } from '../../src/common/store/cards';
import { parseCard } from '../../src/common/util/cards';

function asArrayOfStrings(str: string | string[]): string[] {
  return isArray(str) ? str : [str];
}

const oldConsoleError = console.error;

// Tests that all the built-in cards parse as expected.
// Before running this test, make sure the wordbots-parser server is running on port 8080.
// eslint-disable-next-line jest/no-disabled-tests
describe.skip('Built-in cards', () => {
  beforeAll(() => {
    console.error = noop;
  });

  collection.forEach((card) => {
    const { abilities, command, name, text } = card;

    if (text && !text.includes(",.")) {  // Ignore vanilla and "French vanilla" cards
      it(`${name}: ${text}`, (done) => {
        const expectedJs: string[] = (command ? asArrayOfStrings(command) : asArrayOfStrings(abilities || []));

        parseCard(
          card,
          (_, actualJs) => {
            expect(actualJs).toEqual(expectedJs);
            done();
          },
          noop,
          { disableIndexing: true }
        );
      });
    }
  });

  afterAll(() => {
    console.error = oldConsoleError;
  });
});
