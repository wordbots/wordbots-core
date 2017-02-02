import { TYPE_ROBOT, TYPE_EVENT, TYPE_CORE } from '../constants';

export const blueCoreCard = {
  name: 'Blue Core',
  img: 'core_blue',
  cost: 0,
  type: TYPE_CORE,
  stats: {
    health: 20
  },
  abilities: []
};

export const orangeCoreCard = {
  name: 'Orange Core',
  img: 'core_orange',
  cost: 0,
  type: TYPE_CORE,
  stats: {
    health: 20
  },
  abilities: []
};

export const attackBotCard = {
  name: 'Attack Bot',
  img: 'char',
  cost: 1,
  type: TYPE_ROBOT,
  stats: {
    health: 1,
    speed: 2,
    attack: 1
  },
  abilities: []
};

export const tankBotCard = {
  name: 'Tank Bot',
  img: 'char_weapon',
  cost: 3,
  type: TYPE_ROBOT,
  stats: {
    health: 4,
    speed: 1,
    attack: 2
  },
  abilities: []
};

export const concentrationCard = {
  name: 'Concentration',
  text: 'Draw two cards.',
  command: '(function () { actions["draw"](targets["self"](), 2); })',
  cost: 1,
  type: TYPE_EVENT
};

export const superchargeCard = {
  name: 'Supercharge',
  text: 'Gain 2 energy.',
  command: '(function () { actions["modifyEnergy"](targets["self"](), function (x) { return x + 2; }); })',
  cost: 0,
  type: TYPE_EVENT
};

export const rampageCard = {
  name: 'Rampage',
  text: 'Give all robots you control +2 attack.',
  command: '(function () { actions["modifyAttribute"](targets["all"](objectsMatchingCondition("robot", conditions["controlledBy"](targets["self"]()))), "attack", function (x) { return x + 2; }); })',
  cost: 3,
  type: TYPE_EVENT
};

export const wrathOfRobotGodCard = {
  name: 'Wrath of Robot God',
  text: 'Destroy all robots.',
  command: '(function () { actions["destroy"](targets["all"](objectsInPlay("robot"))); })',
  cost: 5,
  type: TYPE_EVENT
};

export const threedomCard = {
  name: 'Threedom',
  text: 'Set all stats of all creatures in play to 3.',
  command: '(function () { actions["setAttribute"](targets["all"](objectsInPlay("robot")), "allattributes", 3); })',
  cost: 3,
  type: TYPE_EVENT
};

export const earthquakeCard = {
  name: 'Earthquake',
  text: 'Destroy all creatures that have less than 2 speed.',
  command: '(function () { actions["destroy"](targets["all"](objectsMatchingCondition("robot", conditions["attributeComparison"]("speed", (function (x) { return x < 2; }))))); })',
  cost: 4,
  type: TYPE_EVENT
};

export const discountCard = {
  name: 'Discount',
  text: 'Reduce the cost of all cards in your hand by 1.',
  command: '(function () { actions["modifyAttribute"](targets["all"](cardsInHand(targets["self"]())), "cost", function (x) { return x - 1; }); })',
  cost: 2,
  type: TYPE_EVENT
};

export const untapCard = {
  name: 'Untap',
  text: 'All creatures you control can move again.',
  command: '(function () { actions["canMoveAgain"](targets["all"](objectsMatchingCondition("robot", conditions["controlledBy"](targets["self"]())))); })',
  cost: 3,
  type: TYPE_EVENT
};

export const missileStrikeCard = {
  name: 'Missile Strike',
  text: 'Deal 5 damage to your opponent.',
  command: '(function () { actions["dealDamage"](targets["opponent"](), 5); })',
  cost: 5,
  type: TYPE_EVENT
};

export const deck = [
  superchargeCard,
  discountCard,
  missileStrikeCard,
  rampageCard,
  untapCard,
  threedomCard,
  earthquakeCard,
  wrathOfRobotGodCard,
  tankBotCard,
  tankBotCard,
  tankBotCard
];
