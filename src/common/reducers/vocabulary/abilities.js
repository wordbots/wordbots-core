export function setAbility(state, currentObject) {
  return function (ability) {
    currentObject.abilities = (currentObject.abilities || []).concat([ability]);
  };
}

// Abilities are functions that return an object the following properties:
//   aid =≥ ('ability ID') unique identifier
//   targets => function that returns targets given board state
//   apply => function that applies the ability to a valid target
//   unapply => function that "un-applies" the ability from a target that is no longer valid

export function abilities(state) {
  return {
    attributeAdjustment: function (targetFunc, attr, func) {
      const aid = Math.random().toString(36);
      return {
        aid: aid,
        targets: targetFunc,
        apply: function (target) {
          if (!target.temporaryStatAdjustments) {
            target.temporaryStatAdjustments = { attack: [], health: [], speed: [] };
          }

          target.temporaryStatAdjustments[attr] = target.temporaryStatAdjustments[attr].concat({
            aid: aid,
            func: func
          });
        },
        unapply: function (target) {
          if (!target.temporaryStatAdjustments) {
            target.temporaryStatAdjustments = { attack: [], health: [], speed: [] };
          } else {
            target.temporaryStatAdjustments[attr] = target.temporaryStatAdjustments[attr].filter(adj =>
              adj.aid != aid
            );
          }
        }
      };
    },

    applyEffect: function (targetFunc, effect) {
      const aid = Math.random().toString(36);
      return {
        aid: aid,
        targets: targetFunc,
        apply: function (target) {
          target.effects = (target.effects || []).concat({
            aid: aid,
            effect: effect
          });
        },
        unapply: function (target) {
          target.effects = (target.effects || []).filter(eff => eff.aid != aid);
        }
      }
    }
  };
}
