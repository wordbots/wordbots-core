import { TYPE_EVENT, TYPE_ROBOT, TYPE_STRUCTURE } from '../../src/common/constants';
import * as w from '../../src/common/types';

/**
 * Returns basic stats for a robot that can move and attack.
 */
const getBasicStats = () => ({
  attack: 1,
  health: 1,
  speed: 2
});

export const cantripCard: w.CardInStore = {
  id: 'Cantrip',
  name: 'Cantrip',
  text: 'Draw a card.',
  command: '(function () { actions["draw"](targets["self"](), 1); })',
  cost: 0,
  type: TYPE_EVENT
};

export const attackBotCard: w.CardInStore = {
  id: 'Attack Bot',
  name: 'Attack Bot',
  cost: 1,
  type: TYPE_ROBOT,
  stats: {
    attack: 1,
    health: 1,
    speed: 2
  },
  abilities: []
};

export const wisdomBotCard: w.CardInStore = {
  id: 'Wisdom Bot',
  name: 'Wisdom Bot',
  cost: 2,
  type: TYPE_ROBOT,
  stats: {
    attack: 1,
    health: 3,
    speed: 1
  },
  text: 'Whenever this robot takes damage, draw a card.',
  abilities: [
    '(function () { setTrigger(triggers["afterDamageReceived"](function () { return targets["thisRobot"](); }), (function () { actions["draw"](targets["self"](), 1); })); })'
  ]
};

export const hasteBotCard: w.CardInStore = {
  id: 'Haste Bot',
  name: 'Haste Bot',
  cost: 2,
  type: TYPE_ROBOT,
  stats: {
    attack: 3,
    health: 1,
    speed: 1
  },
  text: 'Haste',
  abilities: [
    '(function () { setTrigger(triggers["afterPlayed"](function () { return targets["it"](); }), (function () { actions["canMoveAndAttackAgain"](targets["thisRobot"]()); })); })'
  ]
};

export const investorBotCard: w.CardInStore = {
  id: 'Investor Bot',
  name: 'Investor Bot',
  cost: 3,
  type: TYPE_ROBOT,
  stats: {
    attack: 1,
    health: 2,
    speed: 2
  },
  text: 'When this robot is played, reduce the cost of a card in your hand by 2.',
  abilities: [
    '(function () { setTrigger(triggers["afterPlayed"](function () { return targets["thisRobot"](); }), (function () { actions["modifyAttribute"](targets["choose"](cardsInHand(targets["self"](), "anycard")), "cost", function (x) { return x - 2; }); })); })'
  ]
};

export const wrathOfRobotGodCard: w.CardInStore = {
  id: 'Wrath of RoboGod',
  name: 'Wrath of RoboGod',
  text: 'Destroy all robots.',
  command: '(function () { actions["destroy"](objectsInPlay("robot")); })',
  cost: 10,
  type: TYPE_EVENT
};

export const healthAuraCard: w.CardInStore = {
  id: 'Health Aura',
  name: 'Health Aura',
  cost: 3,
  type: TYPE_STRUCTURE,
  stats: {
    health: 5
  },
  text: 'All robots 2 spaces away have +2 health.',
  abilities: [
    '(function () { setAbility(abilities["attributeAdjustment"](function () { return objectsMatchingConditions("robot", [conditions["exactDistanceFrom"](2, targets["thisRobot"]())]); }, "health", function (x) { return x + 2; })); })'
  ]
};

export const instantKernelKillerAbilityCard: w.CardInStore = {
  id: 'Remove Enemy Kernel',
  name: 'Remove Enemy Kernel',
  text: 'At the end of the turn, deal 21 damage to your opponent\'s kernel.',
  cost: 1,
  type: TYPE_ROBOT,
  stats: getBasicStats(),
  abilities: [
    '(function () { setTrigger(triggers["endOfTurn"](function () { return targets["self"](); }), (function () { actions["dealDamage"](objectsMatchingConditions("kernel", [conditions["controlledBy"](targets["opponent"]())]), 21); })); })'
  ]
};

export const reinforcementsCard: w.CardInStore = {
  id: 'Reinforcements',
  name: 'Reinforcements',
  text: 'Spawn a 1/2/1 robot named "Reinforcements" on each tile adjacent to your kernel.',
  command: "(function () { actions['spawnObject'](targets['generateCard']('robot', {'attack': 1, 'health': 2, 'speed': 1}, 'Reinforcements'), tilesMatchingConditions([conditions['adjacentTo'](objectsMatchingConditions('kernel', [conditions['controlledBy'](targets['self']())]))])); })",
  cost: 4,
  type: TYPE_EVENT
};
