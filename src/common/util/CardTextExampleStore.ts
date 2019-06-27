import { capitalize, identity, pullAt, random, shuffle } from 'lodash';

import * as w from '../types';

import { expandKeywords, parseBatch } from './cards';

export default class CardTextExampleStore {
  private examples: { [mode: string]: string[] } = {
    event: [],
    object: []
  };

  public getExample = (mode: w.ParserMode): string => {
    const examples = this.examples[mode];
    const idx = random(0, examples.length - 1);
    const example = pullAt(examples, idx)[0];
    return `${example}.`;
  }

  public loadExamples = (sentences: string[], numToTry: number, onLoad: (s: string) => any = identity): void => {
    const candidates = shuffle(sentences).map(capitalize).map(expandKeywords).slice(0, numToTry);
    const modes = Object.keys(this.examples);

    modes.forEach((mode) => {
      parseBatch(candidates, mode as w.ParserMode, (validSentences: string[]) => {
        this.examples[mode].push(...validSentences);
        onLoad(mode);
      });
    });
  }
}
