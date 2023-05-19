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
  ],
  integrity: [
    {
      "input": "bd4ba675e86063a7d8b389d8089eeb2a",
      "output": "db15e5b2d0137e55e14b8177bf1f2355",
      "hmac": "ba18bce9456aabeb39b7cdd3f313f6921cc5e72d0954dedd71855526105ded48f31536140dbae5deafe868ea58a14797db8a68f5b1db5753177f96e0c9f174e5"
    }
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
  ],
  integrity: [
    {
      "input": "b2f985288542d0e4f49fbb3635c50c84",
      "output": "75521b3ca657616e4e412e27c00d65ea",
      "hmac": "411fa5868630761082391a781e50bc34fa81757b9d8f9d2b3e609b6d559a27f4f1e61ea5b5c1300b43a38a717b1dcee6ba638b30a8d846b7e9e72087f982b27b"
    }
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
  },
  integrity: [
    {
      "input": "0895b001b89fc6dd7f42a6824f501c6b",
      "output": "13d017ed1ada8cae88bac85c82376314",
      "hmac": "a391fb7e2a5997c24c927ad54f317d1d6517fbcb8b991b83f334e5582a3f595b594e9e76d4965978d0a325a9e1fc54a6041344d74de1c3547c397a088397d875"
    }
  ]
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
  ],
  integrity: [
    {
      "input": "c1d638e68297e2b287d25aab4a64465a",
      "output": "53acb3d8d207cf30d315bdc7e58a635a",
      "hmac": "987c2b16767f88e55fce784d53025415aecca305f4cb97d8aee1a6e076f9fddc9bfc5b1d9563711ffd4c0569262a07c86de96af6b6539e815e7f0513677be436"
    }
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
  },
  integrity: [
    {
      "input": "eec456c56851ff5f598df86d6ea2421a",
      "output": "98928c8a0ec5773982ab2e0f65efb8b6",
      "hmac": "fed4c23196820a75752d111822e4955c0ba6aedc4ce04651f29a274760e49e58cc1b87872d75498192ed6b50e4f452396005baeade5eecc72415b6c03bfd54fb"
    }
  ]
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
  ],
  integrity: [
    {
      "input": "f26b9afa222c0d736946610541a793e3",
      "output": "c450d430923291710510a93bb256901a",
      "hmac": "5400cb8ddcdb7c5ee2bf88984dc6e3b6bfa900481de5ed46c67dc4bfaab498b80b4d3364a430b907ca5b49f19343ad2f8a6250fced57f2f0a31326af2ff379e6"
    }
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
  ],
  integrity: [
    {
      "input": "abd5036b9241d72801d89e5dc72a6f19",
      "output": "8aea19b1b12516c07dd5a747e467fd7f",
      "hmac": "cca90dc0eea934d36d91ad56d4b643499e6e845e309d8a884df62f039e665c9f3adc11d77d66b38856172a73c48211bf11c7e955fccfacd9c1dfaf196d688e6c"
    },
    {
      "input": "3a34c12e9e810cd9176d74d1fa2b224e",
      "output": "e9babad5f7dc0a176af07a001ca9c091",
      "hmac": "3e83e2666d6ab595dda99a017b4ef0efe602270ed439a3be89d46b072016e07dd7c263f288f9000a586b13e94752861e9161a9c1055768e2fbc2e686459202c1"
    }
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
  ],
  integrity: [
    {
      "input": "eb374bc69c86d6089b05ece9c9e5a0fc",
      "output": "ff4ece129d068ee933249d0564390d48",
      "hmac": "c8b02e5afe7048f977e16e232d058c59c21eb60d62abe159d9a7811b40e254e1f17b608d27b97c08b5d26fe77dccf7e90b0710029a2c9b720229d47873d436d1"
    },
    {
      "input": "c718fe9c6d59e37597406e0119dc8fea",
      "output": "9580ababa82ac6b7bb47b1cbc6396bfd",
      "hmac": "a4b82743ff226cf572dfd39c13707bfe9fbb1c130c6708ed82022971ed78e250baf185d91926a1f06fccd4e12ce3f1066611fd15292916910f45adf8b90b91d7"
    }
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
  ],
  integrity: [
    {
      "input": "e9e0b81b8aa76ce1ab3f42f588cdabb0",
      "output": "dc274160fe99b599b421ed509ca16a76",
      "hmac": "3284530ef80772c4cb922a33d72a6e76b8f672cef6141f50178898d907fb460c536a00b2d20c7b548d0f581905c2c7ff4fc397b58f24d82898035a47ce692860"
    }
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
  ],
  integrity: [
    {
      "input": "eb374bc69c86d6089b05ece9c9e5a0fc",
      "output": "ff4ece129d068ee933249d0564390d48",
      "hmac": "c8b02e5afe7048f977e16e232d058c59c21eb60d62abe159d9a7811b40e254e1f17b608d27b97c08b5d26fe77dccf7e90b0710029a2c9b720229d47873d436d1"
    },
    {
      "input": "1791d96b0bc46f7084c80a89e0e1b9ca",
      "output": "cd6f38d0c55dd6f5d6113d15ce71e50a",
      "hmac": "63f681c429a431abf94032cb83d152fe07927929f162fdbe31429cefd9f59e3948e3ce355864546f7a550b046837b80d283eb94c40e84d663cd5b88f5fcf2b2e"
    }
  ]
};
