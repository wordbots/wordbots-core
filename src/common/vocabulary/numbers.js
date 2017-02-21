export function attributeSum(state) {
  return function (collection, attribute) {
    return _.sum(Object.values(collection).map(object =>
      object.stats[attribute]
    ));
  };
}

export function attributeValue(state) {
  return function (targetObjects, attribute) {
    const object = targetObjects[0]; // targetObject is an array of objects, so unpack.
    return object.stats[attribute];
  };
}

export function count(state) {
  return function (collection) {
    return _.size(collection);
  };
}
