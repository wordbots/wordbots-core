import {clamp as _clamp, isEqual, isNaN, some} from 'lodash';

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

export function inBrowser() {
  return !(typeof document === 'undefined' || (window.process && window.process.title.includes('node')));
}

export function soundEnabled() {
  return localStorage['wb$soundEnabled'] === 'true';
}

export function toggleSound() {
  localStorage['wb$soundEnabled'] = !soundEnabled();
}

export function logIfFlagSet(flag, msg) {
  if (flag) {
    /* eslint-disable no-console */
    console.log(msg);
    /* eslint-enable no-console */
  }
}
