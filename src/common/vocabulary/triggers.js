export function setTrigger(state, currentObject) {
  return function (trigger, action) {
    currentObject.triggers = currentObject.triggers.concat([{
      trigger: trigger,
      action: `(${action.toString()})`
    }]);
  };
}

export function triggers(state) {
  return {
    afterAttack: function (targetFunc) {
      return {
        'type': 'afterAttack',
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
