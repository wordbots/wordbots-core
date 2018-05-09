import { TYPE_ROBOT, TYPE_EVENT, TYPE_STRUCTURE } from '../../src/common/constants';

/**
 * Returns basic stats for a robot that can move and attack.
 */
const getBasicStats = () => ({
  attack: 1,
  health: 1,
  speed: 2
});

export const attackBotCard = {
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

export const wisdomBotCard = {
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

export const hasteBotCard = {
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

export const investorBotCard = {
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

export const wrathOfRobotGodCard = {
  name: 'Wrath of RoboGod',
  text: 'Destroy all robots.',
  command: '(function () { actions["destroy"](objectsInPlay("robot")); })',
  cost: 10,
  type: TYPE_EVENT
};

export const healthAuraCard = {
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

export const instantKernelKillerAbilityCard = {
  name: 'Remove Enemy Kernel',
  text: 'At the end of the turn, deal 21 damage to your opponent\'s kernel.',
  cost: 1,
  type: TYPE_ROBOT,
  stats: getBasicStats(),
  abilities: [
    '(function () { setTrigger(triggers["endOfTurn"](function () { return targets["self"](); }), (function () { actions["dealDamage"](objectsMatchingConditions("kernel", [conditions["controlledBy"](targets["opponent"]())]), 21); })); })'
  ]
};
