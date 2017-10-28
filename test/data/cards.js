import { TYPE_ROBOT, TYPE_EVENT } from '../../src/common/constants';

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
