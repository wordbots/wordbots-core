import { capitalize, pullAt, random, shuffle } from 'lodash';

import * as w from '../types';

import { expandKeywords, parseBatch } from './cards';

export default class CardTextExampleStore {
  private examples: { [mode: string]: string[] } = {
    event: [],
    object: []
  };

  public getExample = (mode: w.ParserMode): string | null => {
    const examples = this.examples[mode];
    if (examples.length > 0) {
      const idx = random(0, examples.length - 1);
      const example = pullAt(examples, idx)[0];
      return `${example}.`;
    } else {
      return null;
    }
  }

  public loadExamples = (sentences: string[], numToTry: number): Promise<any> => {
    const candidates = shuffle(sentences).map(capitalize).map(expandKeywords).slice(0, numToTry);
    const modes = Object.keys(this.examples);

    return Promise.all(modes.map(async (mode) => {
      const results = await parseBatch(candidates, mode as w.ParserMode);
      const validSentences = results.filter(({ result }) => !result.error).map(({ sentence }) => sentence);
      this.examples[mode].push(...validSentences);
    }));
  }
}
