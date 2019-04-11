import { mapValues, sum } from 'lodash';
import { BigramProbs, buildNGrams, listAllNGrams, UnigramProbs } from 'word-ngrams';

const DISALLOWED_PHRASES = ['all a'];

export function prepareBigramProbs(corpus: string): BigramProbs {
  // e.g. {a: 1, b: 3} => {a: 0.25, b: 0.75}
  function normalizeValues(obj: UnigramProbs): UnigramProbs {
    const total = sum(Object.values(obj));
    return mapValues(obj, (val) => val / total);
  }

  const bigrams: BigramProbs = mapValues(buildNGrams(corpus, 2) as BigramProbs, normalizeValues);

  // Manually set the probability to zero for certain phrases that
  // (while technically valid) aren't the best way of wording something.
  DISALLOWED_PHRASES.forEach((phrase) => {
    const [first, second] = phrase.split(' ');
    bigrams[first][second] = 0;
  });

  return bigrams;
}

export function bigramNLL(phrase: string, bigramProbs: BigramProbs): number {
  const phraseBigrams = listAllNGrams(buildNGrams(`${phrase} .`, 2)).map((b) => b.split(' '));

  let logLikelihood = 0;
  phraseBigrams.forEach(([first, second]) => {
    logLikelihood -= Math.log((bigramProbs[first] || {})[second] || 0.000001);
  });

  return logLikelihood;
}
