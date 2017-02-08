export function setAbility(state, currentObject) {
  return function (ability) {
    currentObject.abilities = (currentObject.abilities || []).concat([ability]);
  };
}

export function abilities(state) {
  return {
    attributeAdjustment: function (targetFunc, attr, func) {
      return {
        aid: Math.random().toString(36),
        targets: targetFunc,
        apply: function (target) {
          target.temporaryStatAdjustments = Object.assign({}, target.temporaryStatAdjustments, {[attr]: func});
        },
        unapply: function (target) {
          target.temporaryStatAdjustments = Object.assign({}, target.temporaryStatAdjustments, {[attr]: null});
        }
      };
    }
  };
}
