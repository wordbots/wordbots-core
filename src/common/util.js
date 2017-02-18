import { TYPE_CORE } from './constants';
import vocabulary from './vocabulary/vocabulary';

// TODO: Split into multiple files.

//
// I. Queries for game state.
//

export function currentPlayer(state) {
  return state.players[state.currentTurn];
}

export function opponentPlayer(state) {
  return state.players[opponentName(state)];
}

export function opponentName(state) {
  return (state.currentTurn == 'blue') ? 'orange' : 'blue';
}

export function allObjectsOnBoard(state) {
  return Object.assign({}, state.players.blue.robotsOnBoard, state.players.orange.robotsOnBoard);
}

export function ownerOf(state, object) {
  if (_.some(state.players.blue.robotsOnBoard, o => o.id == object.id)) {
    return state.players.blue;
  } else if (_.some(state.players.orange.robotsOnBoard, o => o.id == object.id)) {
    return state.players.orange;
  }
}

export function getHex(state, object) {
  return _.findKey(allObjectsOnBoard(state), ['id', object.id]);
}

export function getAttribute(object, attr) {
  if (object.temporaryStatAdjustments && object.temporaryStatAdjustments[attr]) {
    // Apply all temporary adjustments, one at a time, in order.
    return object.temporaryStatAdjustments[attr].reduce((val, adj) => adj.func(val), object.stats[attr]);
  } else {
    return (object.stats[attr] === undefined) ? undefined : object.stats[attr];
  }
}

export function getCost(card) {
  if (card.temporaryStatAdjustments && card.temporaryStatAdjustments.cost) {
    // Apply all temporary adjustments, one at a time, in order.
    return card.temporaryStatAdjustments.cost.reduce((val, adj) => adj.func(val), card.cost);
  } else {
    return card.cost;
  }
}

export function hasEffect(object, effect) {
  return (object.effects || []).map(eff => eff.effect).includes(effect);
}

//
// II. Effects on game state that are performed in many different places.
//

export function drawCards(state, player, count) {
  player.hand = player.hand.concat(player.deck.splice(0, count));
  state = applyAbilities(state);
  return state;
}

export function dealDamageToObjectAtHex(state, amount, hex, cause = null) {
  const object = allObjectsOnBoard(state)[hex];
  object.stats.health -= amount;

  state = checkTriggers(state, 'afterDamageReceived', object, (trigger =>
    trigger.targets.map(o => o.id).includes(object.id)
  ));

  return updateOrDeleteObjectAtHex(state, object, hex, cause);
}

export function updateOrDeleteObjectAtHex(state, object, hex, cause = null) {
  const ownerName = (state.players.blue.robotsOnBoard[hex]) ? 'blue' : 'orange';

  if (getAttribute(object, 'health') > 0 && !object.isDestroyed) {
    state.players[ownerName].robotsOnBoard[hex] = object;
  } else {
    state = checkTriggers(state, 'afterDestroyed', object, (trigger =>
      trigger.targets.map(o => o.id).includes(object.id) && (trigger.cause == cause || trigger.cause == 'anyevent')
    ));

    delete state.players[ownerName].robotsOnBoard[hex];

    // Unapply any abilities that this object had.
    (object.abilities || []).forEach(function (ability) {
      (ability.currentTargets || []).forEach(ability.unapply);
    });

    // Check victory conditions.
    if (object.card.type === TYPE_CORE) {
      state.winner = (ownerName == 'blue') ? 'orange' : 'blue';
    }
  }

  state = applyAbilities(state);

  return state;
}

//
// III. Card behavior: actions, triggers, passive abilities.
//

/* eslint-disable no-unused-vars */
export function executeCmd(state, cmd, currentObject = null) {
  const actions = vocabulary.actions(state);
  const targets = vocabulary.targets(state, currentObject);
  const conditions = vocabulary.conditions(state);
  const triggers = vocabulary.triggers(state);
  const abilities = vocabulary.abilities(state);

  // Global methods
  const setTrigger = vocabulary.setTrigger(state, currentObject);
  const setAbility = vocabulary.setAbility(state, currentObject);
  const allTiles = vocabulary.allTiles(state);
  const cardsInHand = vocabulary.cardsInHand(state);
  const objectsInPlay = vocabulary.objectsInPlay(state);
  const objectsMatchingConditions = vocabulary.objectsMatchingConditions(state);
  const attributeSum = vocabulary.attributeSum(state);
  const attributeValue = vocabulary.attributeValue(state);
  const count = vocabulary.count(state);

  return eval(cmd)();
}
/* eslint-enable no-unused-vars */

export function checkTriggers(state, triggerType, it, condition) {
  Object.values(allObjectsOnBoard(state)).forEach(function (obj) {
    (obj.triggers || []).forEach(function (t) {
      t.trigger.targets = executeCmd(state, t.trigger.targetFunc, obj);
      if (t.trigger.type == triggerType && condition(t.trigger)) {
        console.log(`Executing ${triggerType} trigger: ${t.action}`);
        executeCmd(Object.assign({}, state, {it: it}), t.action, obj);
      }
    });
  });

  return Object.assign({}, state, {it: null});
}

export function applyAbilities(state) {
  Object.values(allObjectsOnBoard(state)).forEach(function (obj) {
    (obj.abilities || []).forEach(function (ability) {
      // Unapply this ability for all previously targeted objects.
      (ability.currentTargets || []).forEach(ability.unapply);

      // Apply this ability to all targeted objects.
      console.log(`Applying ability of ${obj.card.name} to ${ability.targets}`);
      ability.currentTargets = executeCmd(state, ability.targets, obj);
      ability.currentTargets.forEach(ability.apply);
    });
  });

  return state;
}
