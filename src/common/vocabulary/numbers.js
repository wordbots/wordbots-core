import { getAttribute } from '../util/game';

export function attributeSum(state) {
  return function (collection, attribute) {
    return _.sum(collection.map(([hex, object]) =>
      getAttribute(object, attribute)
    ));
  };
}

export function attributeValue(state) {
  return function (targetObjects, attribute) {
    const object = targetObjects[0]; // targetObjects is an array of objects, so unpack.
    return getAttribute(object, attribute);
  };
}

export function count(state) {
  return function (collection) {
    return _.size(collection);
  };
}
