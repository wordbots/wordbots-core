import { isArray, noop } from 'lodash';

import { collection } from '../../src/common/store/cards';
import { parseCard } from '../../src/common/util/cards';

function asArrayOfStrings(str: string | string[]): string[] {
  return isArray(str) ? str : [str];
}

const oldConsoleError = console.error;

// Before running this test, make sure the wordbots-parser server is running on port 8080.
describe.skip('Built-in cards', () => {
  beforeAll(() => {
    console.error = noop;
  });

  // tslint:disable-next-line mocha-no-side-effect-code
  collection.forEach((card) => {
    const { abilities, command, name, text } = card;

    if (text && !text.includes(",.")) {  // Ignore vanilla and "French vanilla" cards
      it(`${name}: ${text}`, (done) => {
        const expectedJs: string[] = (command ? asArrayOfStrings(command) : asArrayOfStrings(abilities || []));

        parseCard(card, (_, actualJs) => {
          expect(actualJs).toEqual(expectedJs);
          done();
        });
      });
    }
  });

  afterAll(() => {
    console.error = oldConsoleError;
  });
});
