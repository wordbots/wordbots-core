import * as w from '../../types';
import { TYPE_EVENT } from '../../constants';

/* eslint-disable quotes */

export const incinerateCard: w.CardInStore = {
  id: 'Incinerate',
  name: 'Incinerate',
  text: 'Gain energy equal to the total power of robots you control. Destroy all robots you control.',
  command: [
    "(function () { actions['modifyEnergy'](targets['self'](), function (x) { return x + attributeSum(objectsMatchingConditions('robot', [conditions['controlledBy'](targets['self']())]), 'attack'); }); })",
    "(function () { actions['destroy'](objectsMatchingConditions('robot', [conditions['controlledBy'](targets['self']())])); })"
  ],
  cost: 0,
  type: TYPE_EVENT
};

export const superchargeCard: w.CardInStore = {
  id: 'Supercharge',
  name: 'Supercharge',
  text: 'Gain 2 energy.',
  command: '(function () { actions["modifyEnergy"](targets["self"](), function (x) { return x + 2; }); })',
  cost: 0,
  type: TYPE_EVENT
};

export const concentrationCard: w.CardInStore = {
  id: 'Concentration',
  name: 'Concentration',
  text: 'Draw 2 cards.',
  command: "(function () { actions['draw'](targets['self'](), 2); })",
  cost: 2,
  type: TYPE_EVENT
};

export const consumeCard: w.CardInStore = {
  id: 'Consume',
  name: 'Consume',
  text: 'Discard a robot card. Gain life equal to its health.',
  command: [
    "(function () { actions['discard'](targets['choose'](cardsInHand(targets['self'](), 'robot'))); })",
    "(function () { actions['modifyAttribute'](targets['all'](objectsMatchingConditions('kernel', [conditions['controlledBy'](targets['self']())])), 'health', function (x) { return x + attributeValue(targets['it'](), 'health'); }); })"
  ],
  cost: 2,
  type: TYPE_EVENT
};

export const gustOfWindCard: w.CardInStore = {
  id: 'Gust of Wind',
  name: 'Gust of Wind',
  text: 'Move a robot up to 2 spaces.',
  command: "(function () { (function () { save('target', targets['choose'](objectsMatchingConditions('robot', []))); })(); (function () { actions['moveObject'](load('target'), targets['choose'](tilesMatchingConditions([conditions['withinDistanceOf'](2, load('target')), conditions['unoccupied']()]))); })(); })",
  cost: 2,
  type: TYPE_EVENT
};

export const smashCard: w.CardInStore = {
  id: 'Smash',
  name: "Smash",
  type: TYPE_EVENT,
  text: "Destroy a structure.",
  cost: 2,
  command: [
    "(function () { actions['destroy'](targets['choose'](objectsInPlay('structure'))); })"
  ]
};

export const vampirePotionCard: w.CardInStore = {
  id: 'Vampire Potion',
  name: 'Vampire Potion',
  text: 'Give a robot "When this robot attacks, restore 3 health to your kernel"',
  command: "(function () { actions['giveAbility'](targets['choose'](objectsMatchingConditions('robot', [])), \"(function () { setTrigger(triggers['afterAttack'](function () { return targets['thisRobot'](); }, 'allobjects'), (function () { actions['restoreHealth'](objectsMatchingConditions('kernel', [conditions['controlledBy'](targets['self']())]), 3); })); })\"); })",
  cost: 2,
  type: TYPE_EVENT
};

export const designatedSurvivorCard: w.CardInStore = {
  id: 'Designated Survivor',
  name: 'Designated Survivor',
  text: 'Double a robot\'s health',
  command: "(function () { actions['modifyAttribute'](targets['choose'](objectsMatchingConditions('robot', [])), 'health', function (x) { return x * 2; }); })",
  cost: 3,
  type: TYPE_EVENT
};

export const discountCard: w.CardInStore = {
  id: 'Discount',
  name: 'Discount',
  text: 'Reduce the cost of all cards in your hand by 1.',
  command: "(function () { actions['modifyAttribute'](targets['all'](cardsInHand(targets['self'](), 'anycard')), 'cost', function (x) { return x - 1; }); })",
  cost: 3,
  type: TYPE_EVENT
};

export const equalizeCard: w.CardInStore = {
  id: 'Equalize',
  name: 'Equalize',
  text: 'Set the attack of all robots equal to their health',
  command: "(function () { actions['setAttribute'](objectsMatchingConditions('robot', []), 'attack', attributeValue(targets['they'](), 'health')); })",
  cost: 3,
  type: TYPE_EVENT
};

export const firestormCard: w.CardInStore = {
  id: 'Firestorm',
  name: 'Firestorm',
  text: 'Deal 1 damage to everything adjacent to a tile.',
  command: '(function () { actions["dealDamage"](targets["all"](objectsMatchingConditions("allobjects", [conditions["adjacentTo"](targets["choose"](allTiles()))])), 1); })',
  cost: 3,
  type: TYPE_EVENT
};

export const rampageCard: w.CardInStore = {
  id: 'Rampage',
  name: 'Rampage',
  text: 'Give all robots you control +2 attack.',
  command: "(function () { actions['modifyAttribute'](objectsMatchingConditions('robot', [conditions['controlledBy'](targets['self']())]), 'attack', function (x) { return x + 2; }); })",
  cost: 3,
  type: TYPE_EVENT
};

export const shockCard: w.CardInStore = {
  id: 'Shock',
  name: 'Shock',
  text: 'Deal 3 damage to a robot.',
  command: '(function () { actions["dealDamage"](targets["choose"](objectsInPlay("robot")), 3); })',
  cost: 3,
  type: TYPE_EVENT
};

export const missileStrikeCard: w.CardInStore = {
  id: 'Missile Strike',
  name: 'Missile Strike',
  text: 'Deal 4 damage to your opponent.',
  command: '(function () { actions["dealDamage"](targets["opponent"](), 4); })',
  cost: 4,
  type: TYPE_EVENT
};

export const threedomCard: w.CardInStore = {
  id: 'Threedom',
  name: 'Threedom',
  text: 'Set all stats of all robots in play to 3.',
  command: "(function () { actions['setAttribute'](objectsInPlay('robot'), 'allattributes', 3); })",
  cost: 4,
  type: TYPE_EVENT
};

export const wisdomCard: w.CardInStore = {
  id: 'Wisdom',
  name: 'Wisdom',
  text: 'Draw cards equal to the number of robots you control.',
  command: '(function () { actions["draw"](targets["self"](), count(objectsMatchingConditions("robot", [conditions["controlledBy"](targets["self"]())]))); })',
  cost: 4,
  type: TYPE_EVENT
};

export const earthquakeCard: w.CardInStore = {
  id: 'Earthquake',
  name: 'Earthquake',
  text: 'Destroy all robots that have less than 2 speed.',
  command: '(function () { actions["destroy"](targets["all"](objectsMatchingConditions("robot", [conditions["attributeComparison"]("speed", (function (x) { return x < 2; }))]))); })',
  cost: 5,
  type: TYPE_EVENT
};

export const greatSimplificationCard: w.CardInStore = {
  id: 'Great Simplification',
  name: 'Great Simplification',
  text: 'Remove all abilities from all robots',
  command: "(function () { actions['removeAllAbilities'](objectsMatchingConditions('robot', [])); })",
  cost: 5,
  type: TYPE_EVENT
};

export const empCard: w.CardInStore = {
  id: 'EMP',
  name: 'EMP',
  text: 'Set the attack and speed of all robots to 0. \nGive all robots "Activate: Destroy this robot".',
  command: [
    "(function () { (function () { save('target', objectsMatchingConditions('robot', [])); })(); (function () { actions['setAttribute'](load('target'), 'attack', 0); })(); (function () { actions['setAttribute'](load('target'), 'speed', 0); })(); })",
    "(function () { actions['giveAbility'](objectsMatchingConditions('robot', []), \"(function () { setAbility(abilities['activated'](function () { return targets['thisRobot'](); }, \\\"(function () { actions['destroy'](targets['thisRobot']()); })\\\")); })\"); })"
  ],
  cost: 7,
  type: TYPE_EVENT
};

export const explosiveBoostCard: w.CardInStore = {
  id: 'Explosive Boost',
  name: 'Explosive Boost',
  text: 'Give your robots +2 attack and +2 health. Deal 1 damage to each enemy object',
  command: [
    "(function () { (function () { save('target', objectsMatchingConditions('robot', [conditions['controlledBy'](targets['self']())])); })(); (function () { actions['modifyAttribute'](load('target'), 'attack', function (x) { return x + 2; }); })(); (function () { actions['modifyAttribute'](load('target'), 'health', function (x) { return x + 2; }); })(); })",
    "(function () { actions['dealDamage'](objectsMatchingConditions('allobjects', [conditions['controlledBy'](targets['opponent']())]), 1); })"
  ],
  cost: 8,
  type: TYPE_EVENT
};
