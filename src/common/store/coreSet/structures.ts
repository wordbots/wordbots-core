import { TYPE_STRUCTURE } from '../../constants';
import * as w from '../../types';

export const fortificationCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Fortification',
  name: 'Fortification',
  cost: 2,
  type: TYPE_STRUCTURE,
  stats: {
    health: 4
  },
  text: 'Your adjacent robots have +1 health.',
  abilities: [
    "(function () { setAbility(abilities['attributeAdjustment'](function () { return objectsMatchingConditions('robot', [conditions['adjacentTo'](targets['thisRobot']()), conditions['controlledBy'](targets['self']())]); }, 'health', function (x) { return x + 1; })); })"
  ]
};

export const energyWellCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Energy Well',
  name: 'Energy Well',
  cost: 2,
  type: TYPE_STRUCTURE,
  stats: {
    health: 5
  },
  text: "At the start of each player's turn, that player gains 1 energy if they control an adjacent robot.",
  abilities: [
    "(function () { setTrigger(triggers['beginningOfTurn'](function () { return targets['allPlayers'](); }), (function () { if (globalConditions['collectionExists'](objectsMatchingConditions('robot', [conditions['adjacentTo'](targets['thisRobot']()), conditions['controlledBy'](targets['itP']())]))) { ((function () { actions['modifyEnergy'](targets['itP'](), function (x) { return x + 1; }); }))(); } })); })"
  ]
};

export const antiGravityFieldCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: "Anti-Gravity Field",
  name: "Anti-Gravity Field",
  type: TYPE_STRUCTURE,
  spriteID: "jjax9vh3xh",
  text: "All robots have Jump.",
  cost: 3,
  abilities: [
    "(function () { setAbility(abilities['giveAbility'](function () { return objectsMatchingConditions('robot', []); }, \"(function () { setAbility(abilities['applyEffect'](function () { return targets['thisRobot'](); }, 'canmoveoverobjects')); })\")); })"
  ],
  stats: {
    health: 5
  }
};

export const acceleratorCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Accelerator',
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

export const magpieMachineCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: "Magpie Machine",
  name: "Magpie Machine",
  type: TYPE_STRUCTURE,
  spriteID: "vw3x59ovn0q",
  text: "All robots have \"Whenever this robot attacks a kernel, draw a card\".",
  cost: 3,
  abilities: [
    "(function () { setAbility(abilities['giveAbility'](function () { return objectsMatchingConditions('robot', []); }, \"(function () { setTrigger(triggers['afterAttack'](function () { return targets['thisRobot'](); }, 'kernel'), (function () { actions['draw'](targets['self'](), 1); })); })\")); })"
  ],
  stats: {
    health: 4
  }
};

export const arenaCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Arena',
  name: 'Arena',
  cost: 3,
  type: TYPE_STRUCTURE,
  stats: {
    health: 3
  },
  text: 'Whenever a robot is destroyed in combat, deal 1 damage to its controller.',
  abilities: [
    "(function () { setTrigger(triggers['afterDestroyed'](function () { return targets['all'](objectsMatchingConditions('robot', [])); }, 'combat'), (function () { actions['dealDamage'](targets['controllerOf'](targets['it']()), 1); })); })"
  ]
};

export const killingBeamCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Killing Beam',
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

export const healingWellCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Healing Well',
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

export const mirrorCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Mirror',
  name: 'Mirror',
  cost: 4,
  type: TYPE_STRUCTURE,
  stats: {
    health: 2
  },
  text: 'When you play a robot, this structure becomes a copy of that robot.',
  abilities: [
    "(function () { setTrigger(triggers['afterCardPlay'](function () { return targets['self'](); }, 'robot'), (function () { actions['become'](targets['thisRobot'](), targets['copyOf'](targets['that']())); })); })"
  ]
};

export const theBombCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'The Bomb',
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
