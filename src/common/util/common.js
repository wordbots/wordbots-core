import {clamp as _clamp, isEqual, isNaN, mapValues, some, sum} from 'lodash';
import {buildNGrams, listAllNGrams} from 'word-ngrams';

// Utility functions used everywhere.

export function id() {
  return Math.random().toString(36).slice(2, 16);
}

// See http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
export function hashCode(s) {
  if (!s) return 0;
  let value = 0;
  // eslint-disable-next-line no-loops/no-loops
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    value = ((value<<5)-value)+char;
    value = value & value;
  }
  return Math.abs(value);
}

// https://stackoverflow.com/a/14224813
export function convertRange(value, r1, r2) {
  return (value - r1[0]) * (r2[1] - r2[0]) / (r1[1] - r1[0]) + r2[0];
}

export function compareCertainKeys(obj1, obj2, keys) {
  return !some(keys, key => !isEqual(obj1[key], obj2[key]));
}

export function clamp(func) {
  return (stat => _clamp(func(stat), 0, 99));
}

export function applyFuncToField(obj, func, field) {
  return Object.assign({}, obj, {[field]: clamp(func)(obj[field])});
}

// http://stackoverflow.com/a/28248573
export function arrayToSentence(arr) {
  return arr.slice(0, -2).join(', ') +
    (arr.slice(0, -2).length ? ', ' : '') +
    arr.slice(-2).join(' and ');
}

// Returns error on failure or nothing on success.
export function ensureInRange(name, value, min, max) {
  if (isNaN(parseInt(value))) {
    return `Invalid ${name}.`;
  } else if (value < min || value > max) {
    return `Not between ${min} and ${max}.`;
  }
}

// Helper methods relating to bigrams.

const DISALLOWED_PHRASES = ['all a'];

export function prepareBigramProbs(corpus) {
  // e.g. {a: 1, b: 3} => {a: 0.25, b: 0.75}
  function normalizeValues(obj) {
    const total = sum(Object.values(obj));
    return mapValues(obj, val => val / total);
  }

  const bigrams = mapValues(buildNGrams(corpus, 2), normalizeValues);

  // Manually set the probability to zero for certain phrases that
  // (while technically valid) aren't the best way of wording something.
  DISALLOWED_PHRASES.forEach((phrase) => {
    const [first, second] = phrase.split(' ');
    bigrams[first][second] = 0;
  });

  return bigrams;
}

export function bigramNLL(phrase, bigramProbs) {
  const phraseBigrams = listAllNGrams(buildNGrams(`${phrase} .`, 2)).map(b => b.split(' '));

  let logLikelihood = 0;
  phraseBigrams.forEach(([first, second]) => {
    logLikelihood -= Math.log((bigramProbs[first] || {})[second] || 0.000001);
  });

  return logLikelihood;
}
