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
  metadata: { source: { type: 'user' } as w.CardSource },
  id: 'Cantrip',
  name: 'Cantrip',
  text: 'Draw a card.',
  command: '(function () { actions["draw"](targets["self"](), 1); })',
  cost: 0,
  type: TYPE_EVENT
};

export const attackBotCard: w.CardInStore = {
  metadata: { source: { type: 'user' } as w.CardSource },
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
  metadata: { source: { type: 'user' } as w.CardSource },
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
  metadata: { source: { type: 'user' } as w.CardSource },
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
  metadata: { source: { type: 'user' } as w.CardSource },
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
  metadata: { source: { type: 'user' } as w.CardSource },
  id: 'Wrath of RoboGod',
  name: 'Wrath of RoboGod',
  text: 'Destroy all robots.',
  command: '(function () { actions["destroy"](objectsInPlay("robot")); })',
  cost: 10,
  type: TYPE_EVENT
};

export const healthAuraCard: w.CardInStore = {
  metadata: { source: { type: 'user' } as w.CardSource },
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
  metadata: { source: { type: 'user' } as w.CardSource },
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
  metadata: { source: { type: 'user' } as w.CardSource },
  id: 'Reinforcements',
  name: 'Reinforcements',
  text: 'Spawn a 1/2/1 robot named "Reinforcements" on each tile adjacent to your kernel.',
  command: "(function () { actions['spawnObject'](targets['generateCard']('robot', {'attack': 1, 'health': 2, 'speed': 1}, 'Reinforcements'), tilesMatchingConditions([conditions['adjacentTo'](objectsMatchingConditions('kernel', [conditions['controlledBy'](targets['self']())]))])); })",
  cost: 4,
  type: TYPE_EVENT
};

export const discardMuncherCard: w.CardInStore = {
  metadata: { source: { type: 'user' } as w.CardSource },
  id: 'Discard Muncher',
  name: 'Discard Muncher',
  text: 'Whenever any card enters your discard pile, gain 1 life.',
  abilities: [
    "(function () { setTrigger(triggers['afterCardEntersDiscardPile'](function () { return targets['self'](); }, 'anycard'), (function () { actions['modifyAttribute'](objectsMatchingConditions('kernel', [conditions['controlledBy'](targets['self']())]), 'health', function (x) { return x + 1; }); })); })"
  ],
  cost: 2,
  type: TYPE_ROBOT,
  stats: {
    attack: 1,
    health: 1,
    speed: 1
  },
};

export const fairnessField: w.CardInStore = {
  metadata: { source: { type: 'user' } as w.CardSource },
  id: 'Fairness Field',
  name: 'Fairness Field',
  text: 'Whenever a player draws a card, that player discards a random card.',
  abilities: [
    "(function () { setTrigger(triggers['afterCardDraw'](function () { return targets['allPlayers'](); }, 'anycard'), (function () { actions['discard'](targets['random'](1, cardsInHand(targets['itP'](), 'anycard', []))); })); })"
  ],
  cost: 3,
  type: TYPE_STRUCTURE,
  stats: {
    health: 5
  },
};

export const looterBotCard: w.CardInStore = {
  metadata: { source: { type: 'user' } as w.CardSource },
  id: 'Looter Bot',
  name: 'Looter Bot',
  text: 'Whenever this robot destroys an enemy robot, draw a card.',
  abilities: [
    "(function () { setTrigger(triggers['afterDestroysOtherObject'](function () { return targets['thisRobot'](); }, 'robot'), (function () { actions['draw'](targets['self'](), 1); })); })"
  ],
  cost: 2,
  type: TYPE_ROBOT,
  stats: {
    attack: 2,
    health: 2,
    speed: 1
  },
};

export const walkingMonkCard: w.CardInStore = {
  metadata: { source: { type: 'user' } as w.CardSource },
  id: 'Walking Monk',
  name: 'Walking Monk',
  text: 'Whenever this robot moves, gain 1 life.',
  abilities: [
    "(function () { setTrigger(triggers['afterMove'](function () { return targets['thisRobot'](); }), (function () { actions['modifyAttribute'](objectsMatchingConditions('kernel', [conditions['controlledBy'](targets['self']())]), 'health', function (x) { return x + 1; }); })); })"
  ],
  cost: 3,
  type: TYPE_ROBOT,
  stats: {
    attack: 1,
    health: 1,
    speed: 1
  },
};

export const thresholderCard: w.CardInStore = {
  metadata: { source: { type: 'user' } as w.CardSource },
  id: 'Thresholder',
  name: 'Thresholder',
  text: 'This robot has +4 attack if your discard pile has 5 or more cards.',
  abilities: [
    "(function () { setAbility(abilities['attributeAdjustment'](function () { return targets['conditionOn'](targets['thisRobot'](), function () { return globalConditions['collectionCountComparison'](cardsInDiscardPile(targets['self'](), 'anycard', []), (function (x) { return x >= 5; })); }); }, 'attack', function (x) { return x + 4; })); })"
  ],
  cost: 2,
  type: TYPE_ROBOT,
  stats: {
    attack: 1,
    health: 1,
    speed: 1
  },
};

export const countdownClockCard: w.CardInStore = {
  metadata: { source: { type: 'user' } as w.CardSource },
  id: 'Countdown Clock',
  name: 'Countdown Clock',
  text: 'At the start of your turn, give this object 1 health. \nWhen this object has 15 or more health, you win the game.',
  abilities: [
    "(function () { setTrigger(triggers['beginningOfTurn'](function () { return targets['self'](); }), (function () { actions['modifyAttribute'](targets['thisRobot'](), 'health', function (x) { return x + 1; }); })); })",
    "(function () { setAbility(abilities['conditionalAction'](function () { return globalConditions['targetMeetsCondition'](targets['thisRobot'](), conditions['attributeComparison']('health', (function (x) { return x >= 15; }))); }, (function () { actions['winGame'](targets['self']()); }))); })"
  ],
  cost: 3,
  type: TYPE_STRUCTURE,
  stats: {
    health: 1,
  },
};

export const rageCard: w.CardInStore = {
  metadata: { source: { type: 'user' } as w.CardSource },
  id: 'Rage',
  name: 'Rage',
  text: 'Whenever a robot takes damage, it gains that much attack.',
  abilities: [
    "(function () { setTrigger(triggers['afterDamageReceived'](function () { return targets['all'](objectsMatchingConditions('robot', [])); }), (function () { actions['modifyAttribute'](targets['it'](), 'attack', function (x) { return x + thatMuch(); }); })); })"
  ],
  cost: 3,
  type: TYPE_STRUCTURE,
  stats: {
    health: 3,
  },
};
