import { isEqual, omit } from 'lodash';

import * as w from '../types';

export function setTrigger(state: w.GameState, currentObject: w.Object | null, source: w.AbilityId | null): w.Returns<void> {
  function areTriggersEqual(t1: w.TriggeredAbility, t2: w.TriggeredAbility): boolean {
    /* istanbul ignore next: it's no longer clear to me when this check should actually be run or what its purpose is (see longer comment below) -AN */
    return isEqual(omit(t1, ['trigger']), omit(t2, ['trigger'])) &&
      isEqual(omit(t1.trigger, ['targets']), omit(t2.trigger, ['targets']));
  }

  return (trigger: w.Trigger, action: w.Returns<void>, props: Partial<w.TriggeredAbility> = {}): void => {
    const triggerObj: w.TriggeredAbility = {
      trigger,
      action: `(${action.toString()})`,
      override: false,
      source: source || undefined,
      duration: (state.memory.duration as number | undefined) || undefined,
      text: state.currentCmdText || null,
      ...props
    };

    // Add the trigger unless (1) the trigger has a source AND (2) there's an existing identical trigger on the object.
    // Note that triggers given by passive abilities will generally have a source (and these ones we don't want to stack),
    // while triggers given by actions (or activated abilities, etc) will NOT have a source (and these ones we DO want to allow to stack).
    // TODO Is this actually the desired behavior? I wrote the original areTriggersEqual() check so long ago I'm no longer sure -AN
    if (currentObject && !(source && currentObject.triggers.find((t) => areTriggersEqual(t, triggerObj)))) {
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
    afterAttack: (targetFunc: (state: w.GameState) => w.Target[], defenderType: string): w.Trigger => ({
      type: 'afterAttack',
      defenderType,
      targetFunc: `(${targetFunc.toString()})`
    }),

    afterAttackedBy: (targetFunc: (state: w.GameState) => w.Target[], attackerType: string): w.Trigger => ({
      type: 'afterAttackedBy',
      attackerType,
      targetFunc: `(${targetFunc.toString()})`
    }),

    afterCardEntersDiscardPile: (targetFunc: (state: w.GameState) => w.Target[], cardType: w.CardTypeQuery | w.CardTypeQuery[]): w.Trigger => ({
      type: 'afterCardEntersDiscardPile',
      cardType,
      targetFunc: `(${targetFunc.toString()})`
    }),

    afterCardDraw: (targetFunc: (state: w.GameState) => w.Target[], cardType: w.CardTypeQuery | w.CardTypeQuery[]): w.Trigger => ({
      type: 'afterCardDraw',
      cardType,
      targetFunc: `(${targetFunc.toString()})`
    }),

    afterCardPlay: (targetFunc: (state: w.GameState) => w.Target[], cardType: w.CardTypeQuery | w.CardTypeQuery[]): w.Trigger => ({
      type: 'afterCardPlay',
      cardType,
      targetFunc: `(${targetFunc.toString()})`
    }),

    afterDamageReceived: (targetFunc: (state: w.GameState) => w.Target[], damageSourceCardType: string): w.Trigger => ({
      type: 'afterDamageReceived',
      damageSourceCardType,
      targetFunc: `(${targetFunc.toString()})`
    }),

    afterDealsDamage: (targetFunc: (state: w.GameState) => w.Target[], objectType: w.CardTypeQuery | w.CardTypeQuery[]): w.Trigger => ({
      type: 'afterDealsDamage',
      cardType: objectType,
      targetFunc: `(${targetFunc.toString()})`
    }),

    afterDestroyed: (targetFunc: (state: w.GameState) => w.Target[], cause: w.Cause): w.Trigger => ({
      type: 'afterDestroyed',
      cause,
      targetFunc: `(${targetFunc.toString()})`
    }),

    afterDestroysOtherObject: (targetFunc: (state: w.GameState) => w.Target[], objectType: w.CardTypeQuery | w.CardTypeQuery[]): w.Trigger => ({
      type: 'afterDestroysOtherObject',
      cardType: objectType,
      targetFunc: `(${targetFunc.toString()})`
    }),

    afterMove: (targetFunc: (state: w.GameState) => w.Target[]): w.Trigger => ({
      type: 'afterMove',
      targetFunc: `(${targetFunc.toString()})`
    }),

    afterPlayed: (targetFunc: (state: w.GameState) => w.Target[]): w.Trigger => ({
      type: 'afterPlayed',
      targetFunc: `(${targetFunc.toString()})`
    }),

    beginningOfTurn: (targetFunc: (state: w.GameState) => w.Target[]): w.Trigger => ({
      type: 'beginningOfTurn',
      targetFunc: `(${targetFunc.toString()})`
    }),

    endOfTurn: (targetFunc: (state: w.GameState) => w.Target[]): w.Trigger => ({
      type: 'endOfTurn',
      targetFunc: `(${targetFunc.toString()})`
    })
  };
}
