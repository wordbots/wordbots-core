import { getAttribute } from '../util';

export function attributeSum(state) {
  return function (collection, attribute) {
    return _.sum(Object.values(collection).map(object =>
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
