import { TYPE_ROBOT } from '../../constants';

/* eslint-disable quotes */

export const crawlingWallCard = {
  name: 'Crawling Wall',
  cost: 1,
  type: TYPE_ROBOT,
  stats: {
    attack: 0,
    health: 3,
    speed: 1
  },
  text: 'Taunt',
  abilities: [
    "(function () { setAbility(abilities['applyEffect'](function () { return objectsMatchingConditions('robot', [conditions['adjacentTo'](targets['thisRobot']()), conditions['controlledBy'](targets['opponent']())]); }, 'canonlyattack', {target: targets['thisRobot']()})); })"
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

export const oneBotCard = {
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

export const madGamblerCard = {
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

export const speedyBotCard = {
  name: "Speedy Bot",
  type: TYPE_ROBOT,
  cost: 1,
  spriteID: "cjslwbmwgua",
  text: "Haste.\nStartup: Lose 2 life.",
  stats: {
    health: 1,
    speed: 2,
    attack: 3
  },
  abilities: [
    "(function () { setTrigger(triggers['afterPlayed'](function () { return targets['it'](); }), (function () { actions['canMoveAndAttackAgain'](targets['thisRobot']()); })); })",
    "(function () { setTrigger(triggers['afterPlayed'](function () { return targets['thisRobot'](); }), (function () { actions['dealDamage'](targets['self'](), 2); })); })"
  ]
};

export const bloodSwordmasterCard = {
  name: "Blood Swordmaster",
  type: TYPE_ROBOT,
  cost: 2,
  spriteID: "hnawh0i9rzb",
  text: "Activate: Give a friendly robot +2 attack, then deal 3 damage to your kernel. ",
  stats: {
    health: 1,
    speed: 3,
    attack: 3
  },
  abilities: [
    "(function () { setAbility(abilities['activated'](function () { return targets['thisRobot'](); }, \"(function () { (function () { actions['modifyAttribute'](targets['choose'](objectsMatchingConditions('robot', [conditions['controlledBy'](targets['self']())])), 'attack', function (x) { return x + 2; }); })(); (function () { actions['dealDamage'](objectsMatchingConditions('kernel', [conditions['controlledBy'](targets['self']())]), 3); })(); })\")); })"
  ]
};

export const medicBotCard = {
  name: 'Medic Bot',
  cost: 2,
  type: TYPE_ROBOT,
  stats: {
    attack: 1,
    health: 1,
    speed: 2
  },
  text: 'Activate: Restore 1 health to all adjacent friendly robots',
  abilities: [
    "(function () { setAbility(abilities['activated'](function () { return targets['thisRobot'](); }, \"(function () { actions['restoreHealth'](objectsMatchingConditions('robot', [conditions['adjacentTo'](targets['thisRobot']()), conditions['controlledBy'](targets['self']())]), 1); })\")); })"
  ]
};

export const mercenaryBlacksmithCard = {
  name: "Mercenary Blacksmith",
  type: TYPE_ROBOT,
  cost: 2,
  spriteID: "ns8lr4xvtbk",
  text: "At the start of your turn, a random friendly robot gains 1 attack and a random enemy robot gains 1 attack.",
  stats: {
    health: 1,
    speed: 3,
    attack: 3
  },
  abilities: [
    "(function () { setTrigger(triggers['beginningOfTurn'](function () { return targets['self'](); }), (function () { (function () { actions['modifyAttribute'](targets['random'](1, objectsMatchingConditions('robot', [conditions['controlledBy'](targets['self']())])), 'attack', function (x) { return x + 1; }); })(); (function () { actions['modifyAttribute'](targets['random'](1, objectsMatchingConditions('robot', [conditions['controlledBy'](targets['opponent']())])), 'attack', function (x) { return x + 1; }); })(); })); })"
  ]
};

export const thornyBushCard = {
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

export const batteryBotCard = {
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

export const governmentResearcherCard = {
  name: 'Gov\'t Researcher',
  cost: 3,
  type: TYPE_ROBOT,
  stats: {
    attack: 1,
    health: 4,
    speed: 2
  },
  text: 'Activate: Pay 1 energy and each player draws a card',
  abilities: [
    "(function () { setAbility(abilities['activated'](function () { return targets['thisRobot'](); }, \"(function () { (function () { actions['payEnergy'](targets['self'](), 1); })(); (function () { actions['draw'](targets['allPlayers'](), 1); })(); })\")); })"
  ]
};

export const hermesCard = {
  name: "Hermes",
  type: TYPE_ROBOT,
  cost: 3,
  spriteID: "kjj5rtqzcms",
  text: "All robots have +1 speed.",
  stats: {
    health: 2,
    speed: 1,
    attack: 1
  },
  abilities: [
    "(function () { setAbility(abilities['attributeAdjustment'](function () { return objectsMatchingConditions('robot', []); }, 'speed', function (x) { return x + 1; })); })"
  ]
};

export const kernelEaterCard = {
  name: "Kernel Eater",
  type: TYPE_ROBOT,
  cost: 3,
  spriteID: "lh57hglh3nl",
  text: "At the end of your turn, deal 1 damage to each player.",
  stats: {
    health: 3,
    speed: 1,
    attack: 1
  },
  abilities: [
    "(function () { setTrigger(triggers['endOfTurn'](function () { return targets['self'](); }), (function () { actions['dealDamage'](targets['allPlayers'](), 1); })); })"
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

export const pacifistCard = {
  name: 'Pacifist',
  cost: 3,
  type: TYPE_ROBOT,
  stats: {
    attack: 2,
    health: 3,
    speed: 1
  },
  text: 'At the end of each turn, each kernel gains 1 health',
  abilities: [
    "(function () { setTrigger(triggers['endOfTurn'](function () { return targets['allPlayers'](); }), (function () { actions['modifyAttribute'](objectsMatchingConditions('kernel', []), 'health', function (x) { return x + 1; }); })); })"
  ]
};

export const recklessBerserkerCard = {
  name: "Reckless Berserker",
  type: TYPE_ROBOT,
  cost: 3,
  spriteID: "rnfdngv4gm",
  text: "Haste.",
  stats: {
    health: 1,
    speed: 3,
    attack: 3
  },
  abilities: [
    "(function () { setTrigger(triggers['afterPlayed'](function () { return targets['it'](); }), (function () { actions['canMoveAndAttackAgain'](targets['thisRobot']()); })); })"
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

export const redBotCard = {
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

export const roboSlugCard = {
  name: "Robo Slug",
  type: TYPE_ROBOT,
  cost: 3,
  spriteID: "2icq34datl7",
  text: "Startup: Deal 2 damage to your opponent.",
  stats: {
    health: 2,
    speed: 1,
    attack: 2
  },
  abilities: [
    "(function () { setTrigger(triggers['afterPlayed'](function () { return targets['thisRobot'](); }), (function () { actions['dealDamage'](targets['opponent'](), 2); })); })"
  ]
};

export const bloodDonorCard = {
  name: 'Blood Donor',
  cost: 4,
  type: TYPE_ROBOT,
  stats: {
    attack: 2,
    health: 5,
    speed: 1
  },
  text: "Startup: Give adjacent robots 3 health",
  abilities: [
    "(function () { setTrigger(triggers['afterPlayed'](function () { return targets['thisRobot'](); }), (function () { actions['modifyAttribute'](objectsMatchingConditions('robot', [conditions['adjacentTo'](targets['thisRobot']())]), 'health', function (x) { return x + 3; }); })); })"
  ]
};

export const blueBotCard = {
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

export const energyHoarderCard = {
  name: "Energy Hoarder",
  type: TYPE_ROBOT,
  cost: 4,
  spriteID: "ctlljzk4jq",
  text: "Activate: Pay 3 energy and discard a card, then this robot gains 1 attack and 1 health.",
  stats: {
    health: 2,
    speed: 3,
    attack: 4
  },
  abilities: [
    "(function () { setAbility(abilities['activated'](function () { return targets['thisRobot'](); }, \"(function () { (function () { actions['payEnergy'](targets['self'](), 3); })(); (function () { (function () { actions['discard'](targets['choose'](cardsInHand(targets['self'](), 'anycard'))); })(); (function () { (function () { save('target', targets['thisRobot']()); })(); (function () { actions['modifyAttribute'](load('target'), 'attack', function (x) { return x + 1; }); })(); (function () { actions['modifyAttribute'](load('target'), 'health', function (x) { return x + 1; }); })(); })(); })(); })\")); })"
  ]
};

export const friendlyRiotShieldCard = {
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

export const knowledgeBotCard = {
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

export const leapFrogBotCard = {
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

export const calmMonkCard = {
  name: 'Calm Monk',
  cost: 5,
  type: TYPE_ROBOT,
  stats: {
    attack: 5,
    health: 4,
    speed: 1
  },
  text: 'At the start of your turn, pay 1 energy and this robot gains 1 health.',
  abilities: [
    "(function () { setTrigger(triggers['beginningOfTurn'](function () { return targets['self'](); }), (function () { (function () { actions['payEnergy'](targets['self'](), 1); })(); (function () { actions['modifyAttribute'](targets['thisRobot'](), 'health', function (x) { return x + 1; }); })(); })); })"
  ]
};

export const royalGuardCard = {
  name: 'Royal Guard',
  cost: 5,
  type: TYPE_ROBOT,
  stats: {
    attack: 2,
    health: 10,
    speed: 1
  },
  text: 'Defender,. taunt',
  abilities: [
    "(function () { setAbility(abilities['applyEffect'](function () { return targets['thisRobot'](); }, 'cannotattack')); })",
    "(function () { setAbility(abilities['applyEffect'](function () { return targets['all'](objectsMatchingConditions('robot', [conditions['adjacentTo'](targets['thisRobot']()), conditions['controlledBy'](targets['opponent']())])); }, 'canonlyattack', {target: targets['thisRobot']()})); })"
  ]
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

export const effectiveTrollCard = {
  name: 'Effective Troll',
  cost: 7,
  type: TYPE_ROBOT,
  stats: {
    attack: 7,
    health: 7,
    speed: 2
  },
  abilities: [
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
