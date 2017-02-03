export function attributeSum(state) {
  return function (collection, attribute) {
    return _.sum(Object.values(collection).map(object => object.stats[attribute]));
  };
}

// TODO attributeValue - -may be difficult to test without triggers?

export function count(state) {
  return function (collection) {
    return _.size(collection);
  }
}
