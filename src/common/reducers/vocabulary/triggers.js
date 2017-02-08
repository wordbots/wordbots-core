export function setTrigger(state, currentObject) {
  return function (trigger, action) {
    currentObject.triggers = currentObject.triggers.concat([{
      trigger: trigger,
      action: '(' + action.toString() + ')'
    }]);
  };
}

export function triggers(state) {
  return {
    afterAttack: function (objects) {
      return {
        'type': 'afterAttack',
        'objects': objects.map(hexObj => hexObj[1])
      };
    },

    afterDamageReceived: function (objects) {
      return {
        'type': 'afterDamageReceived',
        'objects': objects.map(hexObj => hexObj[1])
      };
    },

    afterPlayed: function (objects) {
      return {
        'type': 'afterPlayed',
        'objects': objects.map(hexObj => hexObj[1])
      };
    },

    beginningOfTurn: function (players) {
      return {
        'type': 'beginningOfTurn',
        'players': players
      };
    },

    endOfTurn: function (players) {
      return {
        'type': 'endOfTurn',
        'players': players
      };
    }
  };
}
