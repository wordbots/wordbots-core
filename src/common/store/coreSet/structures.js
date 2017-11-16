import { TYPE_STRUCTURE } from '../../constants';

/* eslint-disable quotes */

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

export const acceleratorCard = {
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

export const killingBeamCard = {
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

export const healingWellCard = {
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

export const mirrorCard = {
  name: 'Mirror',
  cost: 4,
  type: TYPE_STRUCTURE,
  stats: {
    health: 2
  },
  text: 'When you play a robot, this structure becomes a copy of it.',
  abilities: [
    "(function () { setTrigger(triggers['afterCardPlay'](function () { return targets['self'](); }, 'robot'), (function () { actions['becomeACopy'](targets['thisRobot'](), targets['it']()); })); })"
  ]
};


export const theBombCard = {
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
