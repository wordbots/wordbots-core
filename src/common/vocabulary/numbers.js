import { isFunction, size, sum } from 'lodash';

import { getAttribute } from '../util/game.ts';

export function attributeSum(state) {
  return function compute(targetObjects, attribute) {
    // Handle wrapped targets (see targets.they).
    if (isFunction(targetObjects)) {
      return currentState => compute(targetObjects(currentState), attribute);
    }

    return sum(targetObjects.entries.map(obj => getAttribute(obj, attribute)));
  };
}

export function attributeValue(state) {
  return function compute(targetObjects, attribute) {
    // Handle wrapped targets (see targets.they).
    if (isFunction(targetObjects)) {
      return currentState => compute(targetObjects(currentState), attribute);
    }

    const object = targetObjects.entries[0]; // targetObjects is an array of objects, so unpack.
    return object ? getAttribute(object, attribute) : 0;
  };
}

export function count(state) {
  return function (collection) {
    return size(collection.entries);
  };
}

export function energyAmount(state) {
  return function (player) {
    return player.energy.available;
  };
}
