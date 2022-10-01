import { clamp as _clamp, fromPairs, isEqual, isNaN, isString, isUndefined, last, some } from 'lodash';

import * as w from '../types';

type Range = [number, number];

// Utility functions used everywhere.

/** Return a random id of 15 base-36 characters. */
export function id(): string {
  return Math.random().toString(36).slice(2, 16);
}

/** Returns a numeric hashcode of a given string.
  * See http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/ */
export function hashCode(s: string): number {
  if (!s) {
    return 0;
  }
  let value = 0;
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    value = ((value << 5) - value) + char;  // eslint-disable-line no-bitwise
    value = value & value;  // eslint-disable-line no-bitwise
  }
  return Math.abs(value);
}

/** Convert a number from one range to another range.
  * See https://stackoverflow.com/a/14224813 */
export function convertRange(value: number, r1: Range, r2: Range): number {
  return (value - r1[0]) * (r2[1] - r2[0]) / (r1[1] - r1[0]) + r2[0];
}

/** Return whether two objects are equal, looking only at certain keys. */
export function compareCertainKeys(obj1: any, obj2: any, keys: string[]): boolean {
  return !some(keys, (key) => !isEqual(obj1[key], obj2[key]));
}

/** Given a (number => number) function (or a stringified representation of same),
  * returns that function but with its output "clamped" to the [0, 99] range. */
export function clamp(func: ((x: number) => number) | w.StringRepresentationOf<(x: number) => number>): (x?: number) => number {
  return ((x) => _clamp((isString(func) ? eval(func) : func)(x || 0), 0, 99));  // eslint-disable-line no-eval
}

/** Given an object, a (number => number) function (or stringified representation), and a field name,
  * returns the object with the function applied to the given field. */
export function applyFuncToField<T extends string, R extends Record<T, number>>(obj: R, func: ((x: number) => number) | w.StringRepresentationOf<(x?: number) => number>, field: T): R {
  return applyFuncToFields(obj, func, [field]);
}

/** Given an object, a (number => number) function (or stringified representation), and a list of fields,
  * returns the object with the function applied to the given fields. */
export function applyFuncToFields<T>(obj: T, func: ((x: number) => number) | w.StringRepresentationOf<(x?: number) => number>, fields: string[]): T {
  return {
    ...obj,
    ...fromPairs(fields.map((field) => [field, clamp(func)((obj as unknown as Record<string, number>)[field])]))
  };
}

/** Given an array of strings, return a "humanized" representation.
  * See http://stackoverflow.com/a/28248573 */
export function arrayToSentence(arr: string[]): string {
  return arr.slice(0, -2).join(', ') +
    (arr.slice(0, -2).length > 0 ? ', ' : '') +
    arr.slice(-2).join(' and ');
}

/** Given a numeric value and a [min, max] range, validate that the value is within the range.
  * Returns an error message string on failure, or null on success. */
export function ensureInRange(name: string, value: number | string, min: number, max: number): string | null {
  const val = isString(value) ? parseInt(value, 10) : value;
  if (isNaN(val)) {
    return `Invalid ${name}.`;
  } else if (val < min || val > max) {
    return `Not between ${min} and ${max}.`;
  } else {
    return null;
  }
}

/** Execute the given functions one-by-one, with the given delay (in ms) in between (using timeout shenanigans). */
export function animate(fns: Array<() => void>, delay: number): void {
  if (fns.length > 0) {
    const [first, ...rest] = fns;
    first();
    setTimeout(() => animate(rest, delay), delay);
  }
}

/** Removes all undefined (but not null) fields recursively from an object. */
export function withoutEmptyFields<T>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([_k, v]) => !isUndefined(v))) as T;
}

/** Given a (potentially null) sentence, return the sentence with a trailing period if it doesn't have one. */
export function withTrailingPeriod(sentence: string | null): string {
  if (sentence && sentence.length > 0 && last(sentence) !== '.') {
    return `${sentence}.`;
  } else {
    return sentence || '';
  }
}
