import { size, sum } from 'lodash';

import { getAttribute } from '../util/game';

export function attributeSum(state) {
  return function (collection, attribute) {
    return sum(collection.entries.map(obj => getAttribute(obj, attribute)));
  };
}

export function attributeValue(state) {
  return function (targetObjects, attribute) {
    const object = targetObjects.entries[0]; // targetObjects is an array of objects, so unpack.
    return getAttribute(object, attribute);
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
