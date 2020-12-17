import { noop } from 'lodash';

import * as w from '../types';
import { id } from '../util/common';
import { executeCmd, reversedCmd } from '../util/game';

export function setAbility(state: w.GameState, currentObject: w.Object | null, source: w.AbilityId | null): w.Returns<void> {
  return (ability) => {
    if (currentObject && (!source || !currentObject.abilities.find((a) => a.source === source))) {
      ability = {
        ...ability,
        source,
        duration: state.memory.duration || null
      };

      currentObject.abilities = currentObject.abilities.concat([ability]);
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

// Abilities are functions that return an object the following properties:
//   aid => ('ability ID') unique identifier
//   targets => function that returns targets when called with executeCmd
//   apply => function that applies the ability to a valid target
//   unapply => function that "un-applies" the ability from a target that is no longer valid

interface PassiveAbilityObj {
  aid: string
  targets: w.StringRepresentationOf<() => w.Object[]>
  apply: (target: w.Object) => void
  unapply: (target: w.Object) => void
}

export function abilities(state: w.GameState): Record<string, w.Returns<PassiveAbilityObj>> {
  return {
    activated: (targetFunc: (s: w.GameState) => w.Target[], action) => {
      const aid: w.AbilityId = id();
      const cmdText: string = state.currentCmdText || '';

      return {
        aid,
        targets: `(${targetFunc.toString()})`,
        apply: (target: w.Object) => {
          target.activatedAbilities = (target.activatedAbilities || []);

          if (!target.activatedAbilities.find((a) => a.aid === aid)) {
            target.activatedAbilities = target.activatedAbilities.concat({
              aid,
              text: cmdText.replace('Activate: ', ''),
              cmd: action
            });
          }
        },
        unapply: (target: w.Object) => {
          target.activatedAbilities = (target.activatedAbilities || []).filter((a) => a.aid !== aid);
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
        apply: (target: w.Object | w.CardInGame) => {
          if (attr === 'allattributes') {
            (['attack', 'health', 'speed'] as w.Attribute[]).forEach((att) => adjustAttr(target, att));
          } else {
            adjustAttr(target, attr);
          }
        },
        unapply: (target: w.Object | w.CardInGame) => {
          if (attr === 'allattributes') {
            (['attack', 'health', 'speed'] as w.Attribute[]).forEach((att) => unadjustAttr(target, att));
          } else {
            unadjustAttr(target, attr);
          }
        }
      };
    },

    applyEffect: (targetFunc: (s: w.GameState) => w.Target[], effect: w.EffectType, props = {}) => {
      const aid: w.AbilityId = id();
      return {
        aid,
        targets: `(${targetFunc.toString()})`,
        apply: (target: w.Object) => {
          if (!(target.effects || []).find((eff) => eff.aid === aid)) {
            target.effects = (target.effects || []).concat({
              aid,
              effect,
              props
            });
          }
        },
        unapply: (target: w.Object) => {
          target.effects = (target.effects || []).filter((eff) => eff.aid !== aid);
        }
      };
    },

    conditionalAction: (conditionFunc: (s: w.GameState) => boolean, cmd) => {
      console.log(conditionFunc.toString());

      const aid: w.AbilityId = id();
      const targetFuncStr =
        `(function () { return ((${conditionFunc.toString()})() ? targets['thisRobot']() : { type: 'objects', entries: [] } ); })`;
      return {
        aid,
        targets: targetFuncStr,
        apply: (target: w.Object) => {
          executeCmd(state, cmd, target, aid);
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
        apply: (target: w.Object) => {
          executeCmd(state, cmd, target, aid);
        },
        unapply: (target: w.Object) => {
          executeCmd(state, reversedCmd(cmd), target, aid);
        }
      };
    }
  };
}
