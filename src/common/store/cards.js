import { TYPE_ROBOT, TYPE_EVENT, TYPE_CORE, TYPE_STRUCTURE } from '../constants';

export const blueCoreCard = {
  name: 'Blue Kernel',
  img: 'core_blue',
  cost: 0,
  type: TYPE_CORE,
  stats: {
    health: 20
  },
  abilities: []
};

export const orangeCoreCard = {
  name: 'Orange Kernel',
  img: 'core_orange',
  cost: 0,
  type: TYPE_CORE,
  stats: {
    health: 20
  },
  abilities: []
};

const attackBotCard = {
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

const tankBotCard = {
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

const concentrationCard = {
  name: 'Concentration',
  text: 'Draw two cards.',
  command: '(function () { actions["draw"](targets["self"](), 2); })',
  cost: 1,
  type: TYPE_EVENT
};

const superchargeCard = {
  name: 'Supercharge',
  text: 'Gain 2 energy.',
  command: '(function () { actions["modifyEnergy"](targets["self"](), function (x) { return x + 2; }); })',
  cost: 0,
  type: TYPE_EVENT
};

const rampageCard = {
  name: 'Rampage',
  text: 'Give all robots you control +2 attack.',
  command: '(function () { actions["modifyAttribute"](targets["all"](objectsMatchingConditions("robot", [conditions["controlledBy"](targets["self"]())])), "attack", function (x) { return x + 2; }); })',
  cost: 3,
  type: TYPE_EVENT
};

const wrathOfRobotGodCard = {
  name: 'Wrath of RoboGod',
  text: 'Destroy all robots.',
  command: '(function () { actions["destroy"](targets["all"](objectsInPlay("robot"))); })',
  cost: 5,
  type: TYPE_EVENT
};

const threedomCard = {
  name: 'Threedom',
  text: 'Set all stats of all robots in play to 3.',
  command: '(function () { actions["setAttribute"](targets["all"](objectsInPlay("robot")), "allattributes", 3); })',
  cost: 3,
  type: TYPE_EVENT
};

const earthquakeCard = {
  name: 'Earthquake',
  text: 'Destroy all robots that have less than 2 speed.',
  command: '(function () { actions["destroy"](targets["all"](objectsMatchingConditions("robot", [conditions["attributeComparison"]("speed", (function (x) { return x < 2; }))]))); })',
  cost: 4,
  type: TYPE_EVENT
};

const discountCard = {
  name: 'Discount',
  text: 'Reduce the cost of all cards in your hand by 1.',
  command: '(function () { actions["modifyAttribute"](targets["all"](cardsInHand(targets["self"]())), "cost", function (x) { return x - 1; }); })',
  cost: 2,
  type: TYPE_EVENT
};

const untapCard = {
  name: 'Untap',
  text: 'All robots you control can move again.',
  command: '(function () { actions["canMoveAgain"](targets["all"](objectsMatchingConditions("robot", [conditions["controlledBy"](targets["self"]())]))); })',
  cost: 3,
  type: TYPE_EVENT
};

const missileStrikeCard = {
  name: 'Missile Strike',
  text: 'Deal 5 damage to your opponent.',
  command: '(function () { actions["dealDamage"](targets["opponent"](), 5); })',
  cost: 5,
  type: TYPE_EVENT
};

const incinerateCard = {
  name: 'Incinerate',
  text: 'Gain energy equal to the total power of robots you control. Destroy all robots you control.',
  command: [
    '(function () { actions["modifyEnergy"](targets["self"](), function (x) { return x + attributeSum(objectsMatchingConditions("robot", [conditions["controlledBy"](targets["self"]())]), "attack"); }); })',
    '(function () { actions["destroy"](targets["all"](objectsMatchingConditions("robot", [conditions["controlledBy"](targets["self"]())]))); })'
  ],
  cost: 1,
  type: TYPE_EVENT
};

const wisdomCard = {
  name: 'Wisdom',
  text: 'Draw cards equal to the number of robots you control.',
  command: '(function () { actions["draw"](targets["self"](), count(objectsMatchingConditions("robot", [conditions["controlledBy"](targets["self"]())]))); })',
  cost: 3,
  type: TYPE_EVENT
};

const shockCard = {
  name: 'Shock',
  text: 'Deal 3 damage to a robot.',
  command: '(function () { actions["dealDamage"](targets["choose"](objectsInPlay("robot")), 3); })',
  cost: 1,
  type: TYPE_EVENT
};

const firestormCard = {
  name: 'Firestorm',
  text: 'Deal 1 damage to everything adjacent to a tile.',
  command: '(function () { actions["dealDamage"](targets["all"](objectsMatchingConditions("allobjects", [conditions["adjacentTo"](targets["choose"](allTiles()))])), 1); })',
  cost: 3,
  type: TYPE_EVENT
};

const botOfPainCard = {
  name: 'Bot of Pain',
  img: 'char_orc',
  cost: 3,
  type: TYPE_ROBOT,
  stats: {
    health: 3,
    speed: 1,
    attack: 2
  },
  text: 'At the end of each turn, each robot takes 1 damage.',
  abilities: [
    '(function () { setTrigger(triggers["endOfTurn"](targets["allPlayers"]()), (function () { actions["dealDamage"](targets["all"](objectsInPlay("robot")), 1); })); })'
  ]
};

const dojoDiscipleCard = {
  name: 'Dojo Disciple',
  img: 'char_belt',
  cost: 1,
  type: TYPE_ROBOT,
  stats: {
    health: 1,
    speed: 1,
    attack: 0
  },
  text: 'At the beginning of each of your turns, this robot gains 1 attack.',
  abilities: [
    '(function () { setTrigger(triggers["beginningOfTurn"](targets["self"]()), (function () { actions["modifyAttribute"](targets["thisRobot"](), "attack", function (x) { return x + 1; }); })); })'
  ]
};

const wisdomBotCard = {
  name: 'Wisdom Bot',
  img: 'char_dressed',
  cost: 2,
  type: TYPE_ROBOT,
  stats: {
    health: 3,
    speed: 1,
    attack: 1
  },
  text: 'Whenever this robot takes damage, draw a card.',
  abilities: [
    '(function () { setTrigger(triggers["afterDamageReceived"](targets["thisRobot"]()), (function () { actions["draw"](targets["self"](), 1); })); })'
  ]
};

const generalBotCard = {
  name: 'General Bot',
  img: 'char_goldhat',
  cost: 5,
  type: TYPE_ROBOT,
  stats: {
    health: 5,
    speed: 1,
    attack: 5
  },
  text: 'Your adjacent robots have +1 attack. When this robot is played, all of your robots can move again.',
  abilities: [
    '(function () { setAbility(abilities["attributeAdjustment"](function () { return targets["all"](objectsMatchingConditions("robot", [conditions["adjacentTo"](targets["thisRobot"]()), conditions["controlledBy"](targets["self"]())])); }, "attack", function (x) { return x + 1; })); })',
    '(function () { setTrigger(triggers["afterPlayed"](targets["thisRobot"]()), (function () { actions["canMoveAgain"](targets["all"](objectsMatchingConditions("robot", [conditions["controlledBy"](targets["self"]())]))); })); })'
  ]
};

const monkeyBotCard = {
  name: 'Monkey Bot',
  img: 'monkey',
  cost: 4,
  type: TYPE_ROBOT,
  stats: {
    health: 2,
    speed: 2,
    attack: 2
  },
  text: 'When this robot attacks, it deals damage to all adjacent robots.',
  abilities: [
    '(function () { setTrigger(triggers["afterAttack"](targets["thisRobot"]()), (function () { actions["dealDamage"](targets["all"](objectsMatchingConditions("robot", [conditions["adjacentTo"](targets["thisRobot"]())])), attributeValue(targets["thisRobot"](), "attack")); })); })'
  ]
};

const fortificationCard = {
  name: 'Fortification',
  img: 'castle',
  cost: 1,
  type: TYPE_STRUCTURE,
  stats: {
    health: 5
  },
  text: 'Your adjacent robots have +1 health.',
  abilities: [
    '(function () { setAbility(abilities["attributeAdjustment"](function () { return targets["all"](objectsMatchingConditions("robot", [conditions["adjacentTo"](targets["thisRobot"]()),conditions["controlledBy"](targets["self"]())])); }, "health", function (x) { return x + 1; })); })'
  ]
};

const defenderBotCard = {
  name: 'Defender Bot',
  img: 'char_shield',
  cost: 2,
  type: TYPE_ROBOT,
  stats: {
    health: 3,
    speed: 1,
    attack: 3
  },
  text: 'This robot can\'t attack.',
  abilities: [
    '(function () { setAbility(abilities["applyEffect"](function () { return targets["thisRobot"](); }, "cannotattack")); })'
  ]
};

const recruiterBotCard = {
  name: 'Recruiter Bot',
  img: 'char_tie',
  cost: 4,
  type: TYPE_ROBOT,
  stats: {
    health: 1,
    speed: 1,
    attack: 1
  },
  text: 'Robots you play cost 1 less energy.',
  abilities: [
    '(function () { setAbility(abilities["attributeAdjustment"](function () { return targets["all"](cardsInHand(targets["self"](), "robot")); }, "cost", function (x) { return x - 1; })); })'
  ]
};


export const deck = [
  attackBotCard,
  dojoDiscipleCard,
  concentrationCard,
  superchargeCard,
  recruiterBotCard,
  shockCard,
  earthquakeCard,
  defenderBotCard,
  fortificationCard,
  fortificationCard,
  threedomCard,
  monkeyBotCard,
  generalBotCard,
  wisdomBotCard,
  botOfPainCard,
  tankBotCard,
  firestormCard,
  wisdomCard,
  incinerateCard,
  discountCard,
  missileStrikeCard,
  rampageCard,
  untapCard,
  wrathOfRobotGodCard
].map(card => Object.assign({}, card, {id: Math.random().toString(36)}));
