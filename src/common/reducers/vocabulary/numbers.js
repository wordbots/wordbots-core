export function attributeSum(state) {
  return function (collection, attribute) {
    return _.sum(Object.values(collection).map(object => object.stats[attribute]));
  };
}
