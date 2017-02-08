export function setTrigger(state, currentObject) {
  return function (trigger, action) {
    currentObject.triggers = currentObject.triggers.concat([{
      trigger: trigger,
      action: '(' + action.toString() + ')'
    }]);

    console.log(currentObject.triggers);
  };
}

export function triggers(state) {
  return {
    'afterDamageReceived': function (objects) {
      return {
        'type': 'afterDamageReceived',
        'objects': objects.map(hexObj => hexObj[1])
      };
    },

    'beginningOfTurn': function (players) {
      return {
        'type': 'beginningOfTurn',
        'players': players
      };
    },

    'endOfTurn': function (players) {
      return {
        'type': 'endOfTurn',
        'players': players
      };
    }
  };
}
