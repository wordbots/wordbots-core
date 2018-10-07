import { isEqual, omit } from 'lodash';

import * as w from '../types';

export function setTrigger(state: w.GameState, currentObject: w.Object | null, source: w.AbilityId | null): w.Returns<void> {
  function areTriggersEqual(t1: w.TriggeredAbility, t2: w.TriggeredAbility): boolean {
    return isEqual(omit(t1, ['trigger']), omit(t2, ['trigger'])) &&
      isEqual(omit(t1.trigger, ['targets']), omit(t2.trigger, ['targets']));
  }

  return (trigger: w.Trigger, action: w.Returns<void>, props = {}): void => {
    const triggerObj: w.TriggeredAbility = Object.assign({
      trigger,
      action: `(${action.toString()})`,
      override: false,
      source,
      duration: state.memory.duration || null
    }, props);

    if (currentObject && !currentObject.triggers.find((t) => areTriggersEqual(t, triggerObj))) {
      currentObject.triggers = currentObject.triggers.concat([triggerObj]);
    }
  };
}

export function unsetTrigger(_state: w.GameState, currentObject: w.Object | null, source: w.AbilityId | null): w.Returns<void> {
  return (_trigger: w.Trigger, _action: w.Returns<void>, _props = {}): void => {
    if (currentObject) {
      currentObject.triggers = currentObject.triggers.filter((t) => t.source !== source);
    }
  };
}

export function triggers(_state: w.GameState): Record<string, w.Returns<w.Trigger>> {
  return {
    afterAttack: (targetFunc: (state: w.GameState) => w.Target[], defenderType: string): w.Trigger => {
      return {
        type: 'afterAttack',
        defenderType,
        targetFunc: `(${targetFunc.toString()})`
      };
    },

    afterCardPlay: (targetFunc: (state: w.GameState) => w.Target[], cardType: string): w.Trigger => {
      return {
        type: 'afterCardPlay',
        cardType,
        targetFunc: `(${targetFunc.toString()})`
      };
    },

    afterDamageReceived: (targetFunc: (state: w.GameState) => w.Target[]): w.Trigger => {
      return {
        type: 'afterDamageReceived',
        targetFunc: `(${targetFunc.toString()})`
      };
    },

    afterDestroyed: (targetFunc: (state: w.GameState) => w.Target[], cause: w.Cause): w.Trigger => {
      return {
        type: 'afterDestroyed',
        cause,
        targetFunc: `(${targetFunc.toString()})`
      };
    },

    afterMove: (targetFunc: (state: w.GameState) => w.Target[]): w.Trigger => {
      return {
        type: 'afterMove',
        targetFunc: `(${targetFunc.toString()})`
      };
    },

    afterPlayed: (targetFunc: (state: w.GameState) => w.Target[]): w.Trigger => {
      return {
        type: 'afterPlayed',
        targetFunc: `(${targetFunc.toString()})`
      };
    },

    beginningOfTurn: (targetFunc: (state: w.GameState) => w.Target[]): w.Trigger => {
      return {
        type: 'beginningOfTurn',
        targetFunc: `(${targetFunc.toString()})`
      };
    },

    endOfTurn: (targetFunc: (state: w.GameState) => w.Target[]): w.Trigger => {
      return {
        type: 'endOfTurn',
        targetFunc: `(${targetFunc.toString()})`
      };
    }
  };
}
