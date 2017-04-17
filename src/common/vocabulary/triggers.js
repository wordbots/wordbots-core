export function setTrigger(state, currentObject, source) {
  return function (trigger, action, props = {}) {
    const triggerObj = Object.assign({
      trigger: trigger,
      action: `(${action.toString()})`,
      override: false,
      source: source
    }, props);

    currentObject.triggers = currentObject.triggers.concat([triggerObj]);
  };
}

export function unsetTrigger(state, currentObject, source) {
  return function (trigger, action, props = {}) {
    currentObject.triggers = currentObject.triggers.filter(t => t.source !== source);
  };
}

export function triggers(state) {
  return {
    afterAttack: function (targetFunc, attackedObjectType) {
      return {
        'type': 'afterAttack',
        'attackedObjectType': attackedObjectType,
        'targetFunc': `(${targetFunc.toString()})`
      };
    },

    afterDamageReceived: function (targetFunc) {
      return {
        'type': 'afterDamageReceived',
        'targetFunc': `(${targetFunc.toString()})`
      };
    },

    afterDestroyed: function (targetFunc, cause) {
      return {
        'type': 'afterDestroyed',
        'cause': cause,
        'targetFunc': `(${targetFunc.toString()})`
      };
    },

    afterPlayed: function (targetFunc) {
      return {
        'type': 'afterPlayed',
        'targetFunc': `(${targetFunc.toString()})`
      };
    },

    beginningOfTurn: function (targetFunc) {
      return {
        'type': 'beginningOfTurn',
        'targetFunc': `(${targetFunc.toString()})`
      };
    },

    endOfTurn: function (targetFunc) {
      return {
        'type': 'endOfTurn',
        'targetFunc': `(${targetFunc.toString()})`
      };
    }
  };
}
