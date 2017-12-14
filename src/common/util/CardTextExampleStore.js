import { capitalize, pullAt, random, shuffle } from 'lodash';

import { parseBatch } from './cards';

export default class CardTextExampleStore {
  examples = {
    event: [],
    object: []
  };

  getExample = (mode) => {
    const examples = this.examples[mode];
    const idx = random(0, examples.length - 1);
    const example = pullAt(examples, idx)[0];
    return `${example}.`;
  }

  loadExamples = (sentences, numToTry) => {
    const candidates = shuffle(sentences).map(capitalize).slice(0, numToTry);
    const modes = Object.keys(this.examples);

    modes.forEach(mode => {
      parseBatch(candidates, mode, (sentence, result) => {
        if (!result.error) {
          this.examples[mode].push(sentence);
        }
      });
    });
  }
}
