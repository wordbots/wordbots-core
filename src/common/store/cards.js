import { STARTING_PLAYER_HEALTH, TYPE_ROBOT, TYPE_EVENT, TYPE_CORE, TYPE_STRUCTURE } from '../constants';

/* eslint-disable quotes */

// I. Kernels

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

// II. Test-only cards

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
    "(function () { setTrigger(triggers['afterDamageReceived'](function () { return targets['thisRobot'](); }), (function () { actions['draw'](targets['self'](), 1); })); })"
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
    "(function () { setTrigger(triggers['afterPlayed'](function () { return targets['it'](); }), (function () { actions['canMoveAndAttackAgain'](targets['thisRobot']()); })); })"
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
    "(function () { setTrigger(triggers['afterPlayed'](function () { return targets['thisRobot'](); }), (function () { actions['modifyAttribute'](targets['choose'](cardsInHand(targets['self'](), 'anycard')), 'cost', function (x) { return x - 2; }); })); })"
  ]
};

export const wrathOfRobotGodCard = {
  name: 'Wrath of RoboGod',
  text: 'Destroy all robots.',
  command: "(function () { actions['destroy'](objectsInPlay('robot')); })",
  cost: 10,
  type: TYPE_EVENT
};

// III. Core set

// IIIa. Robots

const oneBotCard = {
  name: 'One Bot',
  cost: 1,
  type: TYPE_ROBOT,
  stats: {
    attack: 1,
    health: 2,
    speed: 2
  },
  abilities: []
};

export const twoBotCard = {
  name: 'Two Bot',
  cost: 2,
  type: TYPE_ROBOT,
  stats: {
    attack: 2,
    health: 4,
    speed: 1
  },
  abilities: []
};

const redBotCard = {
  name: 'Red Bot',
  cost: 3,
  type: TYPE_ROBOT,
  stats: {
    attack: 3,
    health: 3,
    speed: 2
  },
  abilities: []
};

const blueBotCard = {
  name: 'Blue Bot',
  cost: 4,
  type: TYPE_ROBOT,
  stats: {
    attack: 2,
    health: 8,
    speed: 1
  },
  abilities: []
};

export const botOfPainCard = {
  name: 'Bot of Pain',
  cost: 6,
  type: TYPE_ROBOT,
  stats: {
    attack: 5,
    health: 3,
    speed: 1
  },
  text: 'At the end of each turn, each robot takes 1 damage.',
  abilities: [
    "(function () { setTrigger(triggers['endOfTurn'](function () { return targets['allPlayers'](); }), (function () { actions['dealDamage'](objectsInPlay('robot'), 1); })); })"
  ]
};

export const dojoDiscipleCard = {
  name: 'Dojo Disciple',
  cost: 1,
  type: TYPE_ROBOT,
  stats: {
    attack: 0,
    health: 1,
    speed: 1
  },
  text: 'At the beginning of each of your turns, this robot gains 1 attack.',
  abilities: [
    "(function () { setTrigger(triggers['beginningOfTurn'](function () { return targets['self'](); }), (function () { actions['modifyAttribute'](targets['thisRobot'](), 'attack', function (x) { return x + 1; }); })); })"
  ]
};

export const generalBotCard = {
  name: 'General Bot',
  cost: 7,
  type: TYPE_ROBOT,
  stats: {
    attack: 2,
    health: 5,
    speed: 3
  },
  text: 'Startup: All of your other robots can move again. \nAdjacent robots have +1 attack',
  abilities: [
    '(function () { setAbility(abilities["attributeAdjustment"](function () { return targets["all"](objectsMatchingConditions("robot", [conditions["adjacentTo"](targets["thisRobot"]()), conditions["controlledBy"](targets["self"]())])); }, "attack", function (x) { return x + 1; })); })',
    "(function () { setTrigger(triggers['afterPlayed'](function () { return targets['thisRobot'](); }), (function () { actions['canMoveAgain'](other(objectsMatchingConditions('robot', []))); })); })"
  ]
};

export const monkeyBotCard = {
  name: 'Monkey Bot',
  cost: 4,
  type: TYPE_ROBOT,
  stats: {
    attack: 2,
    health: 2,
    speed: 2
  },
  text: 'When this robot attacks, it deals damage to all adjacent robots instead.',
  abilities: [
    "(function () { setTrigger(triggers['afterAttack'](function () { return targets['thisRobot'](); }), (function () { actions['dealDamage'](targets['all'](objectsMatchingConditions('robot', [conditions['adjacentTo'](targets['thisRobot']())])), attributeValue(targets['thisRobot'](), 'attack')); }), {override: true}); })"
  ]
};

export const recruiterBotCard = {
  name: 'Recruiter Bot',
  cost: 3,
  type: TYPE_ROBOT,
  stats: {
    attack: 1,
    health: 1,
    speed: 2
  },
  text: 'Robots you play cost 1 less energy.',
  abilities: [
    '(function () { setAbility(abilities["attributeAdjustment"](function () { return targets["all"](cardsInHand(targets["self"](), "robot")); }, "cost", function (x) { return x - 1; })); })'
  ]
};

export const defenderBotCard = {
  name: 'Defender Bot',
  cost: 4,
  type: TYPE_ROBOT,
  stats: {
    attack: 4,
    health: 4,
    speed: 2
  },
  text: 'Defender,. taunt',
  abilities: [
    "(function () { setAbility(abilities['applyEffect'](function () { return targets['thisRobot'](); }, 'cannotattack')); })",
    "(function () { setAbility(abilities['applyEffect'](function () { return targets['all'](objectsMatchingConditions('robot', [conditions['adjacentTo'](targets['thisRobot']()), conditions['controlledBy'](targets['opponent']())])); }, 'canonlyattack', {target: targets['thisRobot']()})); })"
  ]
};

export const flametongueBotCard = {
  name: 'Flametongue Bot',
  cost: 6,
  type: TYPE_ROBOT,
  stats: {
    attack: 4,
    health: 2,
    speed: 1
  },
  text: 'When this robot is played, deal 4 damage.',
  abilities: [
    "(function () { setTrigger(triggers['afterPlayed'](function () { return targets['thisRobot'](); }), (function () { actions['dealDamage'](targets['choose'](objectsInPlay('allobjects')), 4); })); })"
  ]
};

export const martyrBotCard = {
  name: 'Martyr Bot',
  cost: 3,
  type: TYPE_ROBOT,
  stats: {
    attack: 0,
    health: 3,
    speed: 1
  },
  text: 'When this robot is destroyed, take control of all adjacent robots.',
  abilities: [
    "(function () { setTrigger(triggers['afterDestroyed'](function () { return targets['thisRobot'](); }, 'anyevent'), (function () { actions['takeControl'](targets['self'](), targets['all'](objectsMatchingConditions('robot', [conditions['adjacentTo'](targets['thisRobot']())]))); })); })"
  ]
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
    attack: 1,
    health: 2,
    speed: 2
  }
};

const madGamblerCard = {
  name: 'Mad Gambler',
  cost: 1,
  type: TYPE_ROBOT,
  stats: {
    attack: 1,
    health: 1,
    speed: 1
  },
  text: 'Startup: Gain 2 energy and draw a card. \nShutdown: Your opponent gains 2 energy, then your opponent draws a card',
  abilities: [
    "(function () { setTrigger(triggers['afterPlayed'](function () { return targets['thisRobot'](); }), (function () { (function () { actions['modifyEnergy'](targets['self'](), function (x) { return x + 2; }); })(); (function () { actions['draw'](targets['self'](), 1); })(); })); })",
    "(function () { setTrigger(triggers['afterDestroyed'](function () { return targets['thisRobot'](); }, 'anyevent'), (function () { (function () { actions['modifyEnergy'](targets['opponent'](), function (x) { return x + 2; }); })(); (function () { actions['draw'](targets['opponent'](), 1); })(); })); })"
  ]
};

const thornyBushCard = {
  name: 'Thorny Bush',
  cost: 2,
  type: TYPE_ROBOT,
  stats: {
    attack: 2,
    health: 2,
    speed: 2
  },
  text: 'Taunt',
  abilities: [
    "(function () { setAbility(abilities['applyEffect'](function () { return objectsMatchingConditions('robot', [conditions['adjacentTo'](targets['thisRobot']()), conditions['controlledBy'](targets['opponent']())]); }, 'canonlyattack', {target: targets['thisRobot']()})); })"
  ]
};

const batteryBotCard = {
  name: 'Battery Bot',
  cost: 3,
  type: TYPE_ROBOT,
  stats: {
    attack: 2,
    health: 2,
    speed: 1
  },
  text: 'At the start of your turn, gain 1 energy and lose 1 life.',
  abilities: [
    "(function () { setTrigger(triggers['beginningOfTurn'](function () { return targets['self'](); }), (function () { (function () { actions['modifyEnergy'](targets['self'](), function (x) { return x + 1; }); })(); (function () { actions['dealDamage'](targets['self'](), 1); })(); })); })"
  ]
};

const knowledgeBotCard = {
  name: 'Knowledge Bot',
  cost: 4,
  type: TYPE_ROBOT,
  stats: {
    attack: 2,
    health: 2,
    speed: 1
  },
  text: 'At the start of your turn, draw a card and lose 2 life.',
  abilities: [
    "(function () { setTrigger(triggers['beginningOfTurn'](function () { return targets['self'](); }), (function () { (function () { actions['draw'](targets['self'](), 1); })(); (function () { actions['dealDamage'](targets['self'](), 2); })(); })); })"
  ]
};

const leapFrogBotCard = {
  name: 'Leap Frog Bot',
  cost: 4,
  type: TYPE_ROBOT,
  stats: {
    attack: 2,
    health: 4,
    speed: 3
  },
  text: 'Jump',
  abilities: [
    "(function () { setAbility(abilities['applyEffect'](function () { return targets['thisRobot'](); }, 'canmoveoverobjects')); })"
  ]
};

const friendlyRiotShieldCard = {
  name: 'Friendly Riot Shield',
  cost: 4,
  type: TYPE_ROBOT,
  stats: {
    attack: 2,
    health: 6,
    speed: 3
  },
  text: 'Defender,. haste',
  abilities: [
    "(function () { setAbility(abilities['applyEffect'](function () { return targets['thisRobot'](); }, 'cannotattack')); })",
    "(function () { setTrigger(triggers['afterPlayed'](function () { return targets['it'](); }), (function () { actions['canMoveAndAttackAgain'](targets['thisRobot']()); })); })"
  ]
};

// IIIb. Events

export const concentrationCard = {
  name: 'Concentration',
  text: 'Draw 2 cards.',
  command: "(function () { actions['draw'](targets['self'](), 2); })",
  cost: 2,
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
  command: "(function () { actions['modifyAttribute'](objectsMatchingConditions('robot', [conditions['controlledBy'](targets['self']())]), 'attack', function (x) { return x + 2; }); })",
  cost: 3,
  type: TYPE_EVENT
};

export const threedomCard = {
  name: 'Threedom',
  text: 'Set all stats of all robots in play to 3.',
  command: "(function () { actions['setAttribute'](objectsInPlay('robot'), 'allattributes', 3); })",
  cost: 4,
  type: TYPE_EVENT
};

const earthquakeCard = {
  name: 'Earthquake',
  text: 'Destroy all robots that have less than 2 speed.',
  command: '(function () { actions["destroy"](targets["all"](objectsMatchingConditions("robot", [conditions["attributeComparison"]("speed", (function (x) { return x < 2; }))]))); })',
  cost: 5,
  type: TYPE_EVENT
};

export const discountCard = {
  name: 'Discount',
  text: 'Reduce the cost of all cards in your hand by 1.',
  command: "(function () { actions['modifyAttribute'](targets['all'](cardsInHand(targets['self'](), 'anycard')), 'cost', function (x) { return x - 1; }); })",
  cost: 3,
  type: TYPE_EVENT
};

export const missileStrikeCard = {
  name: 'Missile Strike',
  text: 'Deal 4 damage to your opponent.',
  command: '(function () { actions["dealDamage"](targets["opponent"](), 4); })',
  cost: 4,
  type: TYPE_EVENT
};

export const incinerateCard = {
  name: 'Incinerate',
  text: 'Gain energy equal to the total power of robots you control. Destroy all robots you control.',
  command: [
    "(function () { actions['modifyEnergy'](targets['self'](), function (x) { return x + attributeSum(objectsMatchingConditions('robot', [conditions['controlledBy'](targets['self']())]), 'attack'); }); })",
    "(function () { actions['destroy'](objectsMatchingConditions('robot', [conditions['controlledBy'](targets['self']())])); })"
  ],
  cost: 0,
  type: TYPE_EVENT
};

const wisdomCard = {
  name: 'Wisdom',
  text: 'Draw cards equal to the number of robots you control.',
  command: '(function () { actions["draw"](targets["self"](), count(objectsMatchingConditions("robot", [conditions["controlledBy"](targets["self"]())]))); })',
  cost: 4,
  type: TYPE_EVENT
};

export const shockCard = {
  name: 'Shock',
  text: 'Deal 3 damage to a robot.',
  command: '(function () { actions["dealDamage"](targets["choose"](objectsInPlay("robot")), 3); })',
  cost: 3,
  type: TYPE_EVENT
};

export const firestormCard = {
  name: 'Firestorm',
  text: 'Deal 1 damage to everything adjacent to a tile.',
  command: '(function () { actions["dealDamage"](targets["all"](objectsMatchingConditions("allobjects", [conditions["adjacentTo"](targets["choose"](allTiles()))])), 1); })',
  cost: 3,
  type: TYPE_EVENT
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

export const smashCard = {
  "name": "Smash",
  "type": TYPE_EVENT,
  "text": "Destroy a structure.",
  "cost": 2,
  "command": [
    "(function () { actions['destroy'](targets['choose'](objectsInPlay('structure'))); })"
  ]
};

const empCard = {
  name: 'EMP',
  text: 'Set the attack and speed of all robots to 0. \nGive all robots "Activate: Destroy this robot".',
  command: [
    "(function () { (function () { save('target', objectsMatchingConditions('robot', [])); })(); (function () { actions['setAttribute'](load('target'), 'attack', 0); })(); (function () { actions['setAttribute'](load('target'), 'speed', 0); })(); })",
    "(function () { actions['giveAbility'](objectsMatchingConditions('robot', []), \"(function () { setAbility(abilities['activated'](function () { return targets['thisRobot'](); }, \\\"(function () { actions['destroy'](targets['thisRobot']()); })\\\")); })\"); })"
  ],
  cost: 7,
  type: TYPE_EVENT
};

// IIIc. Structures

export const fortificationCard = {
  name: 'Fortification',
  cost: 2,
  type: TYPE_STRUCTURE,
  stats: {
    health: 4
  },
  text: 'Your adjacent robots have +1 health.',
  abilities: [
    '(function () { setAbility(abilities["attributeAdjustment"](function () { return targets["all"](objectsMatchingConditions("robot", [conditions["adjacentTo"](targets["thisRobot"]()),conditions["controlledBy"](targets["self"]())])); }, "health", function (x) { return x + 1; })); })'
  ]
};

export const energyWellCard = {
  name: 'Energy Well',
  cost: 2,
  type: TYPE_STRUCTURE,
  stats: {
    health: 5
  },
  text: "At the start of each player's turn, that player gains 1 energy if they control an adjacent robot.",
  abilities: [
    "(function () { setTrigger(triggers['beginningOfTurn'](function () { return targets['allPlayers'](); }), (function () { if ((objectsMatchingConditions('robot', [conditions['adjacentTo'](targets['thisRobot']()), conditions['controlledBy'](targets['itP']())]).length > 0)) { ((function () { actions['modifyEnergy'](targets['itP'](), function (x) { return x + 1; }); }))(); } })); })"
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

const acceleratorCard = {
  name: 'Accelerator',
  cost: 3,
  type: TYPE_STRUCTURE,
  stats: {
    health: 2
  },
  text: 'Startup: Give all friendly robots +1 speed and -1 health.',
  abilities: [
    "(function () { setTrigger(triggers['afterPlayed'](function () { return targets['thisRobot'](); }), (function () { (function () { save('target', objectsMatchingConditions('robot', [conditions['controlledBy'](targets['self']())])); })(); (function () { actions['modifyAttribute'](load('target'), 'speed', function (x) { return x + 1; }); })(); (function () { actions['modifyAttribute'](load('target'), 'health', function (x) { return x - 1; }); })(); })); })"
  ]
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

const killingBeamCard = {
  name: 'Killing Beam',
  cost: 4,
  type: TYPE_STRUCTURE,
  stats: {
    health: 1
  },
  text: 'At the start of your turn, this structure gains 1 health. \nActivate: Destroy all robots with cost equal to this structure\'s health.',
  abilities: [
    "(function () { setTrigger(triggers['beginningOfTurn'](function () { return targets['self'](); }), (function () { actions['modifyAttribute'](targets['thisRobot'](), 'health', function (x) { return x + 1; }); })); })",
    "(function () { setAbility(abilities['activated'](function () { return targets['thisRobot'](); }, \"(function () { actions['destroy'](objectsMatchingConditions('robot', [conditions['attributeComparison']('cost', (function (x) { return x === attributeValue(targets['thisRobot'](), 'health'); }))])); })\")); })"
  ]
};

const healingWellCard = {
  name: 'Healing Well',
  cost: 4,
  type: TYPE_STRUCTURE,
  stats: {
    health: 3
  },
  text: 'Activate: Destroy this structure. \nShutdown: Restore all adjacent robots\' health',
  abilities: [
    "(function () { setAbility(abilities['activated'](function () { return targets['thisRobot'](); }, \"(function () { actions['destroy'](targets['thisRobot']()); })\")); })",
    "(function () { setTrigger(triggers['afterDestroyed'](function () { return targets['thisRobot'](); }, 'anyevent'), (function () { actions['restoreHealth'](objectsMatchingConditions('robot', [conditions['adjacentTo'](targets['thisRobot']())])); })); })"
  ]
};

const theBombCard = {
  name: 'The Bomb',
  cost: 6,
  type: TYPE_STRUCTURE,
  stats: {
    health: 2
  },
  text: 'Activate: Destroy this structure. \nShutdown: Deal 2 damage to all objects within 2 spaces.',
  abilities: [
    "(function () { setAbility(abilities['activated'](function () { return targets['thisRobot'](); }, \"(function () { actions['destroy'](targets['thisRobot']()); })\")); })",
    "(function () { setTrigger(triggers['afterDestroyed'](function () { return targets['thisRobot'](); }, 'anyevent'), (function () { actions['dealDamage'](objectsMatchingConditions('allobjects', [conditions['withinDistanceOf'](2, targets['thisRobot']())]), 2); })); })"
  ]
};

/* eslint-enable quotes */

export const collection = [
  oneBotCard,
  twoBotCard,
  redBotCard,
  blueBotCard,
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
  earthquakeCard,
  defenderBotCard,
  threedomCard,
  monkeyBotCard,
  generalBotCard,
  botOfPainCard,
  firestormCard,
  wisdomCard,
  incinerateCard,
  discountCard,
  missileStrikeCard,
  rampageCard,
  energyWellCard,
  smashCard,
  antiGravityFieldCard,
  magpieMachineCard,
  recyclerCard,
  acceleratorCard,
  killingBeamCard,
  healingWellCard,
  theBombCard,
  empCard,
  madGamblerCard,
  thornyBushCard,
  batteryBotCard,
  knowledgeBotCard,
  leapFrogBotCard,
  friendlyRiotShieldCard
].map(card =>
  Object.assign(card, {
    id: `builtin/${card.name}`,
    baseCost: card.cost,
    source: 'builtin'
  })
);
