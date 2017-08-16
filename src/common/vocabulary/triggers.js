import { isEqual, omit } from 'lodash';

export function setTrigger(state, currentObject, source) {
  function areTriggersEqual(t1, t2) {
    return isEqual(omit(t1, ['trigger']), omit(t2, ['trigger'])) &&
      isEqual(omit(t1.trigger, ['targets']), omit(t2.trigger, ['targets']));
  }

  return function (trigger, action, props = {}) {
    const triggerObj = Object.assign({
      trigger: trigger,
      action: `(${action.toString()})`,
      override: false,
      source: source,
      duration: state.memory['duration'] || null
    }, props);

    if (!currentObject.triggers.find(t => areTriggersEqual(t, triggerObj))) {
      currentObject.triggers = currentObject.triggers.concat([triggerObj]);
    }
  };
}

export function unsetTrigger(state, currentObject, source) {
  return function (trigger, action, props = {}) {
    currentObject.triggers = currentObject.triggers.filter(t => t.source !== source);
  };
}

export function triggers(state) {
  return {
    afterAttack: function (targetFunc, defenderType) {
      return {
        'type': 'afterAttack',
        'defenderType': defenderType,
        'targetFunc': `(${targetFunc.toString()})`
      };
    },

    afterCardPlay: function (targetFunc, cardType) {
      return {
        'type': 'afterCardPlay',
        'cardType': cardType,
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

    afterMove: function (targetFunc) {
      return {
        'type': 'afterMove',
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
