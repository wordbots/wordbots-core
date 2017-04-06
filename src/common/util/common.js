import _ from 'lodash';

// Utility functions used everywhere.

export function id() {
  return Math.random().toString(36).slice(2, 16);
}

export function clamp(func) {
  return (stat => _.clamp(func(stat), 0, 99));
}

export function applyFuncToField(obj, func, field) {
  return Object.assign({}, obj, {[field]: clamp(func)(obj[field])});
}

export function inBrowser() {
  return !(typeof document === 'undefined' || (window.process && window.process.title.includes('node')));
}

export function instantiateCard(card) {
  return Object.assign({}, card, {
    id: id(),
    baseCost: card.cost
  });
}
