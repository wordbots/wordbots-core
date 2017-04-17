import { STARTING_PLAYER_HEALTH, TYPE_ROBOT, TYPE_EVENT, TYPE_CORE, TYPE_STRUCTURE } from '../constants';
import { instantiateCard } from '../util/common';

// Note: Exported cards are used in either defaultState (cores) or in tests.

/* eslint-disable quotes */

export const blueCoreCard = {
  name: 'Blue Kernel',
  img: 'core_blue',
  cost: 0,
  type: TYPE_CORE,
  stats: {
    health: STARTING_PLAYER_HEALTH
  },
  abilities: [],
  source: 'builtin'
};

export const orangeCoreCard = {
  name: 'Orange Kernel',
  img: 'core_orange',
  cost: 0,
  type: TYPE_CORE,
  stats: {
    health: STARTING_PLAYER_HEALTH
  },
  abilities: [],
  source: 'builtin'
};

export const attackBotCard = {
  name: 'Attack Bot',
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

const superchargeCard = {
  name: 'Supercharge',
  text: 'Gain 2 energy.',
  command: '(function () { actions["modifyEnergy"](targets["self"](), function (x) { return x + 2; }); })',
  cost: 0,
  type: TYPE_EVENT
};

export const rampageCard = {
  name: 'Rampage',
  text: 'Give all robots you control +2 attack.',
  command: '(function () { actions["modifyAttribute"](targets["all"](objectsMatchingConditions("robot", [conditions["controlledBy"](targets["self"]())])), "attack", function (x) { return x + 2; }); })',
  cost: 3,
  type: TYPE_EVENT
};

export const wrathOfRobotGodCard = {
  name: 'Wrath of RoboGod',
  text: 'Destroy all robots.',
  command: '(function () { actions["destroy"](targets["all"](objectsInPlay("robot"))); })',
  cost: 5,
  type: TYPE_EVENT
};

export const threedomCard = {
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

export const discountCard = {
  name: 'Discount',
  text: 'Reduce the cost of all cards in your hand by 1.',
  command: '(function () { actions["modifyAttribute"](targets["all"](cardsInHand(targets["self"](), "anycard")), "cost", function (x) { return x - 1; }); })',
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

export const missileStrikeCard = {
  name: 'Missile Strike',
  text: 'Deal 5 damage to your opponent.',
  command: '(function () { actions["dealDamage"](targets["opponent"](), 5); })',
  cost: 5,
  type: TYPE_EVENT
};

export const incinerateCard = {
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

export const shockCard = {
  name: 'Shock',
  text: 'Deal 3 damage to a robot.',
  command: '(function () { actions["dealDamage"](targets["choose"](objectsInPlay("robot")), 3); })',
  cost: 1,
  type: TYPE_EVENT
};

export const firestormCard = {
  name: 'Firestorm',
  text: 'Deal 1 damage to everything adjacent to a tile.',
  command: '(function () { actions["dealDamage"](targets["all"](objectsMatchingConditions("allobjects", [conditions["adjacentTo"](targets["choose"](allTiles()))])), 1); })',
  cost: 3,
  type: TYPE_EVENT
};

export const botOfPainCard = {
  name: 'Bot of Pain',
  cost: 3,
  type: TYPE_ROBOT,
  stats: {
    health: 3,
    speed: 1,
    attack: 2
  },
  text: 'At the end of each turn, each robot takes 1 damage.',
  abilities: [
    "(function () { setTrigger(triggers['endOfTurn'](function () { return targets['allPlayers'](); }), (function () { actions['dealDamage'](targets['all'](objectsInPlay('robot')), 1); })); })"
  ]
};

export const dojoDiscipleCard = {
  name: 'Dojo Disciple',
  cost: 1,
  type: TYPE_ROBOT,
  stats: {
    health: 1,
    speed: 1,
    attack: 0
  },
  text: 'At the beginning of each of your turns, this robot gains 1 attack.',
  abilities: [
    "(function () { setTrigger(triggers['beginningOfTurn'](function () { return targets['self'](); }), (function () { actions['modifyAttribute'](targets['thisRobot'](), 'attack', function (x) { return x + 1; }); })); })"
  ]
};

export const wisdomBotCard = {
  name: 'Wisdom Bot',
  cost: 2,
  type: TYPE_ROBOT,
  stats: {
    health: 3,
    speed: 1,
    attack: 1
  },
  text: 'Whenever this robot takes damage, draw a card.',
  abilities: [
    "(function () { setTrigger(triggers['afterDamageReceived'](function () { return targets['thisRobot'](); }), (function () { actions['draw'](targets['self'](), 1); })); })"
  ]
};

export const generalBotCard = {
  name: 'General Bot',
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
    "(function () { setTrigger(triggers['afterPlayed'](function () { return targets['thisRobot'](); }), (function () { actions['canMoveAgain'](targets['all'](objectsMatchingConditions('robot', [conditions['controlledBy'](targets['self']())]))); })); })"
  ]
};

export const monkeyBotCard = {
  name: 'Monkey Bot',
  cost: 4,
  type: TYPE_ROBOT,
  stats: {
    health: 2,
    speed: 2,
    attack: 2
  },
  text: 'When this robot attacks, it deals damage to all adjacent robots instead.',
  abilities: [
    "(function () { setTrigger(triggers['afterAttack'](function () { return targets['thisRobot'](); }), (function () { actions['dealDamage'](targets['all'](objectsMatchingConditions('robot', [conditions['adjacentTo'](targets['thisRobot']())])), attributeValue(targets['thisRobot'](), 'attack')); }), {override: true}); })"
  ]
};

export const fortificationCard = {
  name: 'Fortification',
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

export const defenderBotCard = {
  name: 'Defender Bot',
  cost: 4,
  type: TYPE_ROBOT,
  stats: {
    health: 3,
    speed: 1,
    attack: 3
  },
  text: 'Defender,. taunt',
  abilities: [
    "(function () { setAbility(abilities['applyEffect'](function () { return targets['thisRobot'](); }, 'cannotattack')); })",
    "(function () { setAbility(abilities['applyEffect'](function () { return targets['all'](objectsMatchingConditions('robot', [conditions['adjacentTo'](targets['thisRobot']()), conditions['controlledBy'](targets['opponent']())])); }, 'canonlyattack', {target: targets['thisRobot']()})); })"
  ]
};

export const hasteBotCard = {
  name: 'Haste Bot',
  cost: 2,
  type: TYPE_ROBOT,
  stats: {
    health: 1,
    speed: 1,
    attack: 3
  },
  text: 'Haste',
  abilities: [
    "(function () { setTrigger(triggers['afterPlayed'](function () { return targets['it'](); }), (function () { actions['canMoveAgain'](targets['thisRobot']()); })); })"
  ]
};

export const recruiterBotCard = {
  name: 'Recruiter Bot',
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

export const flametongueBotCard = {
  name: 'Flametongue Bot',
  cost: 3,
  type: TYPE_ROBOT,
  stats: {
    health: 2,
    speed: 1,
    attack: 4
  },
  text: 'When this robot is played, deal 4 damage.',
  abilities: [
    "(function () { setTrigger(triggers['afterPlayed'](function () { return targets['thisRobot'](); }), (function () { actions['dealDamage'](targets['choose'](objectsInPlay('allobjects')), 4); })); })"
  ]
};

export const investorBotCard = {
  name: 'Investor Bot',
  cost: 3,
  type: TYPE_ROBOT,
  stats: {
    health: 2,
    speed: 2,
    attack: 1
  },
  text: 'When this robot is played, reduce the cost of a card in your hand by 2.',
  abilities: [
    "(function () { setTrigger(triggers['afterPlayed'](function () { return targets['thisRobot'](); }), (function () { actions['modifyAttribute'](targets['choose'](cardsInHand(targets['self'](), 'anycard')), 'cost', function (x) { return x - 2; }); })); })"
  ]
};

export const arenaCard = {
  name: 'Arena',
  cost: 3,
  type: TYPE_STRUCTURE,
  stats: {
    health: 3
  },
  text: 'Whenever a robot is destroyed in combat, deal 1 damage to its controller.',
  abilities: [
    "(function () { setTrigger(triggers['afterDestroyed'](function () { return targets['all'](objectsInPlay('robot')); }, 'combat'), (function () { actions['dealDamage'](targets['controllerOf'](targets['it']()), 1); })); })"
  ]
};

export const martyrBotCard = {
  name: 'Martyr Bot',
  cost: 3,
  type: TYPE_ROBOT,
  stats: {
    health: 3,
    speed: 1,
    attack: 0
  },
  text: 'When this robot is destroyed, take control of all adjacent robots.',
  abilities: [
    "(function () { setTrigger(triggers['afterDestroyed'](function () { return targets['thisRobot'](); }, 'anyevent'), (function () { actions['takeControl'](targets['self'](), targets['all'](objectsMatchingConditions('robot', [conditions['adjacentTo'](targets['thisRobot']())]))); })); })"
  ]
};

export const consumeCard = {
  name: 'Consume',
  text: 'Discard a robot card. Gain life equal to its health.',
  command: [
    "(function () { actions['discard'](targets['choose'](cardsInHand(targets['self'](), 'robot'))); })",
    "(function () { actions['modifyAttribute'](targets['all'](objectsMatchingConditions('kernel', [conditions['controlledBy'](targets['self']())])), 'health', function (x) { return x + attributeValue(targets['it'](), 'health'); }); })"
  ],
  cost: 2,
  type: TYPE_EVENT
};

export const energyWellCard = {
  name: 'Energy Well',
  cost: 2,
  type: TYPE_STRUCTURE,
  stats: {
    health: 10
  },
  text: "At the start of each player's turn, that player gains 1 energy if they control an adjacent robot.",
  abilities: [
    "(function () { setTrigger(triggers['beginningOfTurn'](function () { return targets['allPlayers'](); }), (function () { if ((objectsMatchingConditions('robot', [conditions['adjacentTo'](targets['thisRobot']()), conditions['controlledBy'](targets['itP']())]).length > 0)) { ((function () { actions['modifyEnergy'](targets['itP'](), function (x) { return x + 1; }); }))(); } })); })"
  ]
};

export const smashCard = {
  "name": "Smash",
  "type": TYPE_EVENT,
  "text": "Destroy a structure.",
  "cost": 1,
  "command": [
    "(function () { actions['destroy'](targets['choose'](objectsInPlay('structure'))); })"
  ]
};

export const antiGravityFieldCard = {
  name: "Anti-Gravity Field",
  type: TYPE_STRUCTURE,
  spriteID: "jjax9vh3xh",
  text: "All robots have Jump.",
  cost: 3,
  abilities: [
    "(function () { setAbility(abilities['giveAbility'](function () { return targets['all'](objectsInPlay('robot')); }, \"(function () { setAbility(abilities['applyEffect'](function () { return targets['thisRobot'](); }, 'canmoveoverobjects')); })\")); })"
  ],
  stats: {
    health: 5
  }
};

export const magpieMachineCard = {
  name: "Magpie Machine",
  type: TYPE_STRUCTURE,
  spriteID: "vw3x59ovn0q",
  text: "All robots have \"Whenever this robot attacks a kernel, draw a card\".",
  cost: 3,
  abilities: [
    "(function () { setAbility(abilities['giveAbility'](function () { return targets['all'](objectsInPlay('robot')); }, \"(function () { setTrigger(triggers['afterAttack'](function () { return targets['thisRobot'](); }, 'kernel'), (function () { actions['draw'](targets['self'](), 1); })); })\")); })"
  ],
  stats: {
    health: 4
  }
};

export const recyclerCard = {
  name: "Recycler",
  type: TYPE_ROBOT,
  spriteID: "rtom5g6o8yf",
  text: "Activate: Discard a card, then draw a card.",
  cost: 3,
  abilities: [
    "(function () { setAbility(abilities['activated'](function () { return targets['thisRobot'](); }, \"(function () { (function () { actions['discard'](targets['choose'](cardsInHand(targets['self'](), 'anycard'))); })(); (function () { actions['draw'](targets['self'](), 1); })(); })\")); })"
  ],
  stats: {
    health: 1,
    speed: 1,
    attack: 1
  }
};
/* eslint-enable quotes */

export const collection = [
  attackBotCard,
  dojoDiscipleCard,
  concentrationCard,
  flametongueBotCard,
  consumeCard,
  arenaCard,
  fortificationCard,
  shockCard,
  martyrBotCard,
  superchargeCard,
  recruiterBotCard,
  investorBotCard,
  earthquakeCard,
  defenderBotCard,
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
  wrathOfRobotGodCard,
  hasteBotCard,
  energyWellCard,
  smashCard,
  antiGravityFieldCard,
  magpieMachineCard,
  recyclerCard
].map(c =>
  Object.assign(instantiateCard(c), {source: 'builtin'})
);
