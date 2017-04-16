import {clamp as _clamp, isEqual, some} from 'lodash';

// Utility functions used everywhere.

export function id() {
  return Math.random().toString(36).slice(2, 16);
}

// See http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
export function hashCode(s) {
  if (!s) return 0;
  let value = 0;
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    value = ((value<<5)-value)+char;
    value = value & value;
  }
  return Math.abs(value);
}

export function toProperCase(str) {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
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

export function inBrowser() {
  return !(typeof document === 'undefined' || (window.process && window.process.title.includes('node')));
}

export function isHeadless() {
  return (typeof window === 'undefined');
}

export function logIfFlagSet(flag, msg) {
  if (flag) {
    /* eslint-disable no-console */
    console.log(msg);
    /* eslint-enable no-console */
  }
}

export function instantiateCard(card) {
  return Object.assign({}, card, {
    id: id(),
    baseCost: card.cost
  });
}
