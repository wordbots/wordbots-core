import {clamp as _clamp, isEqual, isNaN, some} from 'lodash';

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

export function clamp(func: (x: any) => number): (x: any) => number {
  return ((x) => _clamp(func(x), 0, 99));
}

export function applyFuncToField(obj: any, func: (x: any) => any, field: string): any {
  return Object.assign({}, obj, {[field]: clamp(func)(obj[field])});
}

// http://stackoverflow.com/a/28248573
export function arrayToSentence(arr: string[]): string {
  return arr.slice(0, -2).join(', ') +
    (arr.slice(0, -2).length ? ', ' : '') +
    arr.slice(-2).join(' and ');
}

// Returns error on failure, undefined on success.
export function ensureInRange(name: string, value: string, min: number, max: number): string | undefined {
  if (isNaN(parseInt(value, 10))) {
    return `Invalid ${name}.`;
  } else if (parseInt(value, 10) < min || parseInt(value, 10) > max) {
    return `Not between ${min} and ${max}.`;
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