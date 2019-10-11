import {clamp as _clamp, fromPairs, isEqual, isNaN, isObject, isString, isUndefined, some} from 'lodash';

import * as w from '../types';

type Range = [number, number];

// Utility functions used everywhere.

export function id(): string {
  return Math.random().toString(36).slice(2, 16);
}

// See http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
export function hashCode(s: string): number {
  if (!s) {
    return 0;
  }
  let value = 0;
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    value = ((value << 5) - value) + char;  // tslint:disable-line:no-bitwise
    value = value & value;  // tslint:disable-line:no-bitwise
  }
  return Math.abs(value);
}

// https://stackoverflow.com/a/14224813
export function convertRange(value: number, r1: Range, r2: Range): number {
  return (value - r1[0]) * (r2[1] - r2[0]) / (r1[1] - r1[0]) + r2[0];
}

export function compareCertainKeys(obj1: any, obj2: any, keys: string[]): boolean {
  return !some(keys, (key) => !isEqual(obj1[key], obj2[key]));
}

export function clamp(func: ((x: any) => number) | w.StringRepresentationOf<(x: any) => number>): (x: any) => number {
  return ((x) => _clamp((isString(func) ? eval(func) : func)(x), 0, 99));  // tslint:disable-line no-eval
}

export function applyFuncToField(obj: any, func: ((x: any) => number) | w.StringRepresentationOf<(x: any) => number>, field: string): any {
  return applyFuncToFields(obj, func, [field]);
}

export function applyFuncToFields(obj: any, func: ((x: any) => number) | w.StringRepresentationOf<(x: any) => number>, fields: string[]): any {
  return {
    ...obj,
    ...fromPairs(fields.map((field) => [field, clamp(func)(obj[field])]))
  };
}

// http://stackoverflow.com/a/28248573
export function arrayToSentence(arr: string[]): string {
  return arr.slice(0, -2).join(', ') +
    (arr.slice(0, -2).length ? ', ' : '') +
    arr.slice(-2).join(' and ');
}

// Returns error on failure, undefined on success.
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

// Execute the given functions one-by-one, with the given delay (in ms) in between.
export function animate(fns: Array<() => void>, delay: number): void {
  if (fns.length > 0) {
    const [first, ...rest] = fns;
    first();
    setTimeout(() => animate(rest, delay), delay);
  }
}

// Removes all undefined (but not null) fields recursively from an object.
// Based on https://stackoverflow.com/a/38340730/2608804
// TODO this can be cleaned up a lot with Object.fromEntries() after we upgrade to TypeScript 3.x
export function withoutEmptyFields<T extends object>(obj: T): T {
  return Object.entries(obj)
    .filter(([_k, v]) => !isUndefined(v))
    .reduce(
      // tslint:disable-next-line prefer-object-spread (object spread here doesn't type-check due to a bug in TypeScript <3.2)
      (newObjSoFar, [k, v]) => Object.assign({}, newObjSoFar as T, { [k]: isObject(v) ? withoutEmptyFields(v) : v }),
      {} as T
    );
}
