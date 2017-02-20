import { flatMap, without } from 'lodash';

import { TYPE_ROBOT, TYPE_STRUCTURE, TYPE_CORE } from './constants';
import vocabulary from './vocabulary/vocabulary';
import GridGenerator from './components/react-hexgrid/GridGenerator';
import Hex from './components/react-hexgrid/Hex';
import HexUtils from './components/react-hexgrid/HexUtils';

// TODO: Split into multiple files.

//
// I. Queries for game state.
//

function opponent(playerName) {
  return (playerName == 'blue') ? 'orange' : 'blue';
}

export function opponentName(state) {
  return opponent(state.currentTurn);
}

export function currentPlayer(state) {
  return state.players[state.currentTurn];
}

export function opponentPlayer(state) {
  return state.players[opponentName(state)];
}

export function allObjectsOnBoard(state) {
  return Object.assign({}, state.players.blue.robotsOnBoard, state.players.orange.robotsOnBoard);
}

export function ownerOf(state, object) {
  // TODO handle the case where neither player owns the object.
  const blueObjectIds = Object.values(state.players.blue.robotsOnBoard).map(obj => obj.id);
  return blueObjectIds.includes(object.id) ? state.players.blue : state.players.orange;
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
// II. Grid-related helper functions.
//

export function getHex(state, object) {
  return _.findKey(allObjectsOnBoard(state), ['id', object.id]);
}

export function getAdjacentHexes(hex) {
  return [
    new Hex(hex.q, hex.r - 1, hex.s + 1),
    new Hex(hex.q, hex.r + 1, hex.s - 1),
    new Hex(hex.q - 1, hex.r + 1, hex.s),
    new Hex(hex.q + 1, hex.r - 1, hex.s),
    new Hex(hex.q - 1, hex.r, hex.s + 1),
    new Hex(hex.q + 1, hex.r, hex.s - 1)
  ].filter(hex =>
    // Filter out hexes that are not on the 4-radius hex grid.
    GridGenerator.hexagon(4).map(HexUtils.getID).includes(HexUtils.getID(hex))
  );
}

export function validPlacementHexes(state, playerName, type) {
  let hexes;
  if (type == TYPE_ROBOT) {
    if (playerName === 'blue') {
      hexes = ['-3,-1,4', '-3,0,3', '-4,1,3'].map(HexUtils.IDToHex);
    } else {
      hexes = ['4,-1,-3', '3,0,-3', '3,1,-4'].map(HexUtils.IDToHex);
    }
  } else if (type == TYPE_STRUCTURE) {
    const occupiedHexes = Object.keys(state.players[playerName].robotsOnBoard).map(HexUtils.IDToHex);
    hexes = flatMap(occupiedHexes, getAdjacentHexes);
  }

  return hexes.filter(hex => !allObjectsOnBoard(state)[HexUtils.getID(hex)]);
}

export function validMovementHexes(state, startHex, speed) {
  let validHexes = [startHex];

  for (let distance = 0; distance < speed; distance++) {
    let newHexes = flatMap(validHexes, getAdjacentHexes).filter(hex =>
      !Object.keys(allObjectsOnBoard(state)).includes(HexUtils.getID(hex))
    );

    validHexes = validHexes.concat(newHexes);
  }

  return without(validHexes, startHex);
}

export function validAttackHexes(state, playerName, startHex, speed) {
  let validMoveHexes = [startHex].concat(validMovementHexes(state, startHex, speed - 1));
  let potentialAttackHexes = flatMap(validMoveHexes, getAdjacentHexes);

  return potentialAttackHexes.filter((hex) =>
    Object.keys(state.players[opponent(playerName)].robotsOnBoard).includes(HexUtils.getID(hex))
  );
}

//
// III. Effects on game state that are performed in many different places.
//

export function drawCards(state, player, count) {
  player.hand = player.hand.concat(player.deck.splice(0, count));
  state = applyAbilities(state);
  return state;
}

export function dealDamageToObjectAtHex(state, amount, hex) {
  const object = allObjectsOnBoard(state)[hex];
  object.stats.health -= amount;

  state = checkTriggers(state, 'afterDamageReceived', (trigger =>
    trigger.objects.map(o => o.id).includes(object.id)
  ));

  return updateOrDeleteObjectAtHex(state, object, hex);
}

export function updateOrDeleteObjectAtHex(state, object, hex) {
  const ownerName = (state.players.blue.robotsOnBoard[hex]) ? 'blue' : 'orange';

  if (getAttribute(object, 'health') > 0 && !object.isDestroyed) {
    state.players[ownerName].robotsOnBoard[hex] = object;
  } else {
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
// IV. Card behavior: actions, triggers, passive abilities.
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

  eval(cmd)();
  return state;
}
/* eslint-enable no-unused-vars */

export function checkTriggers(state, triggerType, condition) {
  Object.values(allObjectsOnBoard(state)).forEach(function (obj) {
    (obj.triggers || []).forEach(function (t) {
      if (t.trigger.type == triggerType && condition(t.trigger)) {
        console.log('Executing ' + triggerType + ' trigger: ' + t.action);
        executeCmd(state, t.action, obj);
      }
    });
  });

  return state;
}

export function applyAbilities(state) {
  Object.values(allObjectsOnBoard(state)).forEach(function (obj) {
    (obj.abilities || []).forEach(function (ability) {
      // Unapply this ability for all previously targeted objects.
      (ability.currentTargets || []).forEach(ability.unapply);

      // Apply this ability to all targeted objects.
      ability.currentTargets = ability.targets(state);
      ability.currentTargets.forEach(ability.apply);
    });
  });

  return state;
}
