import { reversedCmd, executeCmd } from '../util/game';

export function setAbility(state, currentObject, source) {
  return function (ability) {
    ability = Object.assign(ability, {source: source});
    currentObject.abilities = currentObject.abilities.concat([ability]);
  };
}

export function unsetAbility(state, currentObject, source) {
  return function () {
    currentObject.abilities = currentObject.abilities.map(ability =>
      Object.assign({}, ability, {disabled: ability.source === source})
    );
  };
}

// Abilities are functions that return an object the following properties:
//   aid => ('ability ID') unique identifier
//   targets => function that returns targets when called with executeCmd
//   apply => function that applies the ability to a valid target
//   unapply => function that "un-applies" the ability from a target that is no longer valid

export function abilities(state) {
  return {
    attributeAdjustment: function (targetFunc, attr, func) {
      const aid = Math.random().toString(36);
      return {
        aid: aid,
        targets: `(${targetFunc.toString()})`,
        apply: function (target) {
          if (!target.temporaryStatAdjustments) {
            target.temporaryStatAdjustments = { attack: [], health: [], speed: [], cost: [] };
          }

          target.temporaryStatAdjustments[attr] = target.temporaryStatAdjustments[attr].concat({
            aid: aid,
            func: func
          });
        },
        unapply: function (target) {
          if (target.temporaryStatAdjustments) {
            target.temporaryStatAdjustments[attr] = target.temporaryStatAdjustments[attr].filter(adj =>
              adj.aid !== aid
            );
          }
        }
      };
    },

    applyEffect: function (targetFunc, effect, props = {}) {
      const aid = Math.random().toString(36);
      return {
        aid: aid,
        targets: `(${targetFunc.toString()})`,
        apply: function (target) {
          if (!(target.effects || []).find(eff => eff.aid === aid)) {
            target.effects = (target.effects || []).concat({
              aid: aid,
              effect: effect,
              props: props
            });
          }
          console.log('Applied', aid, target.effects.length);
        },
        unapply: function (target) {
          target.effects = (target.effects || []).filter(eff => eff.aid !== aid);
          console.log('Unapplied', aid, target.effects.length);
        }
      };
    },

    freezeAttribute: function (targetFunc, attribute) {
      // TODO
    },

    giveAbility: function (targetFunc, cmd) {
      const aid = Math.random().toString(36);
      return {
        aid: aid,
        targets: `(${targetFunc.toString()})`,
        apply: function (target) {
          executeCmd(state, cmd, target, aid);
        },
        unapply: function (target) {
          executeCmd(state, reversedCmd(cmd), target, aid);
        }
      };
    }
  };
}
