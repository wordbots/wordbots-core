import { noop } from 'lodash';

import { isCardInGame, isObject } from '../guards';
import * as w from '../types';
import { id } from '../util/common';
import { executeCmd, reversedCmd } from '../util/game';

export function setAbility(state: w.GameState, currentObject: w.Object | null, source: w.AbilityId | null): w.Returns<void> {
  return (ability: Omit<w.PassiveAbility, 'text'>) => {
    if (currentObject && (!source || !currentObject.abilities.find((a) => a.source === source))) {
      const finalizedAbility: w.PassiveAbility = {
        ...ability,
        source: source || undefined,
        duration: (state.memory.duration as number | undefined) || undefined,
        text: state.currentCmdText || null
      };

      currentObject.abilities = currentObject.abilities.concat([finalizedAbility]);
    }
  };
}

export function unsetAbility(_state: w.GameState, currentObject: w.Object | null, source: w.AbilityId | null): w.Returns<void> {
  return () => {
    if (currentObject) {
      currentObject.abilities = currentObject.abilities.map((ability) => ({
        ...ability,
        disabled: ability.source === source
      }));
    }
  };
}

// Abilities are functions that return a PassiveAbility with the following properties:
//   aid => ('ability ID') unique identifier
//   targets => function that returns targets when called with executeCmd
//   apply => function that applies the ability to a valid target
//   unapply => function that "un-applies" the ability from a target that is no longer valid
//   onlyExecuteOnce => if true, the given ability will be disabled after executing once

export function abilities(state: w.GameState): Record<string, w.Returns<Omit<w.PassiveAbility, 'text'>>> {
  return {
    activated: (targetFunc: (s: w.GameState) => w.Target[], action) => {
      const aid: w.AbilityId = id();
      const cmdText: string = state.currentCmdText || '';

      return {
        aid,
        targets: `(${targetFunc.toString()})`,
        apply: (target: w.Targetable) => {
          if (isObject(target)) {
            target.activatedAbilities = (target.activatedAbilities || []);

            if (!target.activatedAbilities.find((a) => a.aid === aid)) {
              target.activatedAbilities = target.activatedAbilities.concat({
                aid,
                text: cmdText.replace('Activate: ', ''),
                cmd: action
              });
            }
          }
        },
        unapply: (target: w.Targetable) => {
          if (isObject(target)) {
            target.activatedAbilities = (target.activatedAbilities || []).filter((a) => a.aid !== aid);
          }
        }
      };
    },

    attributeAdjustment: (targetFunc: (s: w.GameState) => w.Target[], attr: w.Attribute | 'cost' | 'allattributes', func) => {
      const aid: w.AbilityId = id();

      function adjustAttr(target: w.Object | w.CardInGame, att: w.Attribute | 'cost'): void {
        if (!target.temporaryStatAdjustments) {
          target.temporaryStatAdjustments = { attack: [], health: [], speed: [], cost: [] };
        }

        target.temporaryStatAdjustments[att] = target.temporaryStatAdjustments[att]!.concat({
          aid,
          // Convert func to string so that we can serialize this temporaryStatAdjustment if necessary
          // (e.g. to reveal a card from the server).
          func: `(${func.toString()})`
        });
      }

      function unadjustAttr(target: w.Object | w.CardInGame, att: w.Attribute | 'cost'): void {
        if (target.temporaryStatAdjustments?.[att]) {
          target.temporaryStatAdjustments[att] = target.temporaryStatAdjustments[att]!.filter((adj) =>
            adj.aid !== aid
          );
        }
      }

      return {
        aid,
        targets: `(${targetFunc.toString()})`,
        apply: (target: w.Targetable) => {
          if (isObject(target) || isCardInGame(target)) {
            if (attr === 'allattributes') {
              (['attack', 'health', 'speed'] as w.Attribute[]).forEach((att) => adjustAttr(target, att));
            } else {
              adjustAttr(target, attr);
            }
          }
        },
        unapply: (target: w.Targetable) => {
          if (isObject(target) || isCardInGame(target)) {
            if (attr === 'allattributes') {
              (['attack', 'health', 'speed'] as w.Attribute[]).forEach((att) => unadjustAttr(target, att));
            } else {
              unadjustAttr(target, attr);
            }
          }
        }
      };
    },

    applyEffect: (targetFunc: (s: w.GameState) => w.Target[], effect: w.EffectType, props = {}) => {
      const aid: w.AbilityId = id();
      return {
        aid,
        targets: `(${targetFunc.toString()})`,
        apply: (target: w.Targetable) => {
          if (isObject(target)) {
            if (!(target.effects || []).find((eff) => eff.aid === aid)) {
              target.effects = (target.effects || []).concat({
                aid,
                effect,
                props
              });
            }
          }
        },
        unapply: (target: w.Targetable) => {
          if (isObject(target)) {
            target.effects = (target.effects || []).filter((eff) => eff.aid !== aid);
          }
        }
      };
    },

    conditionalAction: (conditionFunc: (s: w.GameState) => boolean, cmd) => {
      const aid: w.AbilityId = id();
      const targetFuncStr =
        `(function () { return ((${conditionFunc.toString()})() ? targets['thisRobot']() : { type: 'objects', entries: [] } ); })`;
      return {
        aid,
        targets: targetFuncStr,
        apply: (target: w.Targetable) => {
          if (isObject(target)) {
            executeCmd(state, cmd, target, aid);
          }
        },
        unapply: noop,  // Can't "unapply" a one-time action
        onlyExecuteOnce: true
      };
    },

    giveAbility: (targetFunc: (s: w.GameState) => w.Target[], cmd) => {
      const aid: w.AbilityId = id();
      return {
        aid,
        targets: `(${targetFunc.toString()})`,
        apply: (target: w.Targetable) => {
          if (isObject(target)) {
            executeCmd(state, cmd, target, aid);
          }
        },
        unapply: (target: w.Targetable) => {
          if (isObject(target)) {
            executeCmd(state, reversedCmd(cmd), target, aid);
          }
        }
      };
    }
  };
}
