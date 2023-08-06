import { clamp as _clamp, fromPairs, isEqual, isNaN, isObject, isString, isUndefined, last, mapValues, some } from 'lodash';
import * as seededRNG from 'seed-random';

import { IS_PRODUCTION_ENV } from '../constants';
import * as w from '../types';

import { fetchUniversal } from './browser';

type Range = [number, number];
interface ErrorWithMessage {
  message: string
}

// Utility functions used everywhere.

/** Return a random id of 15 base-36 characters. */
export function id(seed?: string): string {
  return (seed ? seededRNG(seed)() : Math.random()).toString(36).slice(2, 16);
}

/** Given a random seed (a number from 0 to 1), deterministically produce the next seed from 0 to 1. */
export function nextSeed(seed: number): number {
  return seededRNG(seed.toString())();
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
export function withoutEmptyFields<T extends {}>(obj: T): T {
  return mapValues(
    Object.fromEntries(
      Object.entries(obj).filter(([_k, v]) => !isUndefined(v))
    ),
    (v) => isObject(v) ? withoutEmptyFields(v) : v
  ) as T;
}

/** Given a (potentially null) sentence, return the sentence with a trailing period if it doesn't have one. */
export function withTrailingPeriod(sentence: string | null): string {
  if (sentence && sentence.length > 0 && last(sentence.trim()) !== '.') {
    return `${sentence}.`;
  } else {
    return sentence || '';
  }
}

/** Given an error of unknown type, check if it is of type { message: string }. */
export function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    isObject(error) &&
    error !== null &&
    'message' in error &&
    isString((error as Record<string, unknown>).message)
  );
}

/** Logs a given message to the #log channel of the Wordbots discord (on production only). */
export function logToDiscord(msg: string): void {
  if (IS_PRODUCTION_ENV) {
    try {
      fetchUniversal('/proxy/DISCORD_PROD_LOG', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: msg,
        }),
      });
    } catch (error) {
      console.error(error);
    }
  }
}

//  Formatted version of a popular md5 implementation
//  Original copyright (c) Paul Johnston & Greg Holt.
//  The function itself is now 42 lines long.
// https://stackoverflow.com/a/60467595
export function md5(inputString: string): string {
  const hc = "0123456789abcdef";
  function rh(n: number) { let j, s = ""; for (j = 0; j <= 3; j++) s += hc.charAt((n >> (j * 8 + 4)) & 0x0F) + hc.charAt((n >> (j * 8)) & 0x0F); return s; }
  function ad(x: number, y: number) { const l = (x & 0xFFFF) + (y & 0xFFFF); const m = (x >> 16) + (y >> 16) + (l >> 16); return (m << 16) | (l & 0xFFFF); }
  function rl(n: number, c: number) { return (n << c) | (n >>> (32 - c)); }
  function cm(q: number, a: number, b: number, x: number, s: number, t: number) { return ad(rl(ad(ad(a, q), ad(x, t)), s), b); }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cm((b & c) | ((~b) & d), a, b, x, s, t); }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cm((b & d) | (c & (~d)), a, b, x, s, t); }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cm(b ^ c ^ d, a, b, x, s, t); }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cm(c ^ (b | (~d)), a, b, x, s, t); }
  function sb(x: string) {
    let i; const nblk = ((x.length + 8) >> 6) + 1; const blks = new Array(nblk * 16); for (i = 0; i < nblk * 16; i++) blks[i] = 0;
    for (i = 0; i < x.length; i++) blks[i >> 2] |= x.charCodeAt(i) << ((i % 4) * 8);
    blks[i >> 2] |= 0x80 << ((i % 4) * 8); blks[nblk * 16 - 2] = x.length * 8; return blks;
  }
  const x = sb(`${inputString}`);
  let i, a = 1732584193, b = -271733879, c = -1732584194, d = 271733878, olda, oldb, oldc, oldd;
  for (i = 0; i < x.length; i += 16) {
    olda = a; oldb = b; oldc = c; oldd = d;
    a = ff(a, b, c, d, x[i + 0], 7, -680876936); d = ff(d, a, b, c, x[i + 1], 12, -389564586); c = ff(c, d, a, b, x[i + 2], 17, 606105819);
    b = ff(b, c, d, a, x[i + 3], 22, -1044525330); a = ff(a, b, c, d, x[i + 4], 7, -176418897); d = ff(d, a, b, c, x[i + 5], 12, 1200080426);
    c = ff(c, d, a, b, x[i + 6], 17, -1473231341); b = ff(b, c, d, a, x[i + 7], 22, -45705983); a = ff(a, b, c, d, x[i + 8], 7, 1770035416);
    d = ff(d, a, b, c, x[i + 9], 12, -1958414417); c = ff(c, d, a, b, x[i + 10], 17, -42063); b = ff(b, c, d, a, x[i + 11], 22, -1990404162);
    a = ff(a, b, c, d, x[i + 12], 7, 1804603682); d = ff(d, a, b, c, x[i + 13], 12, -40341101); c = ff(c, d, a, b, x[i + 14], 17, -1502002290);
    b = ff(b, c, d, a, x[i + 15], 22, 1236535329); a = gg(a, b, c, d, x[i + 1], 5, -165796510); d = gg(d, a, b, c, x[i + 6], 9, -1069501632);
    c = gg(c, d, a, b, x[i + 11], 14, 643717713); b = gg(b, c, d, a, x[i + 0], 20, -373897302); a = gg(a, b, c, d, x[i + 5], 5, -701558691);
    d = gg(d, a, b, c, x[i + 10], 9, 38016083); c = gg(c, d, a, b, x[i + 15], 14, -660478335); b = gg(b, c, d, a, x[i + 4], 20, -405537848);
    a = gg(a, b, c, d, x[i + 9], 5, 568446438); d = gg(d, a, b, c, x[i + 14], 9, -1019803690); c = gg(c, d, a, b, x[i + 3], 14, -187363961);
    b = gg(b, c, d, a, x[i + 8], 20, 1163531501); a = gg(a, b, c, d, x[i + 13], 5, -1444681467); d = gg(d, a, b, c, x[i + 2], 9, -51403784);
    c = gg(c, d, a, b, x[i + 7], 14, 1735328473); b = gg(b, c, d, a, x[i + 12], 20, -1926607734); a = hh(a, b, c, d, x[i + 5], 4, -378558);
    d = hh(d, a, b, c, x[i + 8], 11, -2022574463); c = hh(c, d, a, b, x[i + 11], 16, 1839030562); b = hh(b, c, d, a, x[i + 14], 23, -35309556);
    a = hh(a, b, c, d, x[i + 1], 4, -1530992060); d = hh(d, a, b, c, x[i + 4], 11, 1272893353); c = hh(c, d, a, b, x[i + 7], 16, -155497632);
    b = hh(b, c, d, a, x[i + 10], 23, -1094730640); a = hh(a, b, c, d, x[i + 13], 4, 681279174); d = hh(d, a, b, c, x[i + 0], 11, -358537222);
    c = hh(c, d, a, b, x[i + 3], 16, -722521979); b = hh(b, c, d, a, x[i + 6], 23, 76029189); a = hh(a, b, c, d, x[i + 9], 4, -640364487);
    d = hh(d, a, b, c, x[i + 12], 11, -421815835); c = hh(c, d, a, b, x[i + 15], 16, 530742520); b = hh(b, c, d, a, x[i + 2], 23, -995338651);
    a = ii(a, b, c, d, x[i + 0], 6, -198630844); d = ii(d, a, b, c, x[i + 7], 10, 1126891415); c = ii(c, d, a, b, x[i + 14], 15, -1416354905);
    b = ii(b, c, d, a, x[i + 5], 21, -57434055); a = ii(a, b, c, d, x[i + 12], 6, 1700485571); d = ii(d, a, b, c, x[i + 3], 10, -1894986606);
    c = ii(c, d, a, b, x[i + 10], 15, -1051523); b = ii(b, c, d, a, x[i + 1], 21, -2054922799); a = ii(a, b, c, d, x[i + 8], 6, 1873313359);
    d = ii(d, a, b, c, x[i + 15], 10, -30611744); c = ii(c, d, a, b, x[i + 6], 15, -1560198380); b = ii(b, c, d, a, x[i + 13], 21, 1309151649);
    a = ii(a, b, c, d, x[i + 4], 6, -145523070); d = ii(d, a, b, c, x[i + 11], 10, -1120210379); c = ii(c, d, a, b, x[i + 2], 15, 718787259);
    b = ii(b, c, d, a, x[i + 9], 21, -343485551); a = ad(a, olda); b = ad(b, oldb); c = ad(c, oldc); d = ad(d, oldd);
  }
  return rh(a) + rh(b) + rh(c) + rh(d);
}
