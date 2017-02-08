export function setTrigger(state, currentObject) {
  return function (trigger, action) {
    currentObject.triggers = currentObject.triggers.concat([{
      trigger: trigger,
      action: '(' + action.toString() + ')'
    }]);

    console.log(currentObject);
  };
}

export function triggers(state) {
  return {
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
