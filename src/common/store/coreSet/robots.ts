import { TYPE_ROBOT } from '../../constants';
import * as w from '../../types';

export const crawlingWallCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Crawling Wall',
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
  ],
  integrity: [
    {
      "input": "0c616229c1163efff573a2857f2f7eee",
      "output": "98fa8d56eb24bb205332843d7880f941",
      "hmac": "9d02993be89025f178af0b6b9b1afe86c6c93629dc0298ffb2872b04d73f8b24a83115a52b2deeed847dd6aefc94f39515762ca5b9db34d52935a35694bff2e2"
    }
  ]
};

export const dojoDiscipleCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Dojo Disciple',
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
  ],
  integrity: [
    {
      "input": "c24ca7efd02c7d173a8bac89bcc0d327",
      "output": "731b55e90c7f0a2db860256935727495",
      "hmac": "6613bd84b2e920ccaa08c655bbf6f5d355042a3d526126592bb310d78514b5f7b9b61e98507bce16b1bdc3800d2729547a27d3f46a52705953dcd14d6c91a778"
    }
  ]
};

export const oneBotCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'One Bot',
  name: 'One Bot',
  cost: 1,
  type: TYPE_ROBOT,
  stats: {
    attack: 1,
    health: 2,
    speed: 2
  },
  abilities: [],
  integrity: []
};

export const madGamblerCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Mad Gambler',
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
  ],
  integrity: [
    {
      "input": "f5fe64a21d25fdb9d05f6470821367ee",
      "output": "6b7a4a623c2ea694c614400bf3b91c6a",
      "hmac": "c1ac0775d0504da7bcf70c1eeae85112f4eee478fffd3c191f2c02d0c540d0e20a51e902a8624a49dcae3ccb717ca9f391abb8dbc1e3ff24c7091b7a39b58ce0"
    },
    {
      "input": "6618492f8670341e9150bc5677c5f8b2",
      "output": "b94969f30908615d5651f02ada01b763",
      "hmac": "9f5350eee0029fb38f21cadcde5e11ae42722ad9f98e115e0e951eeb38e326ce6ddf4e10ed28fc7796d1fbe1f205dd3f013cbfc077b821376ed785a396e63768"
    }
  ]
};

export const speedyBotCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: "Speedy Bot",
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
  ],
  integrity: [
    {
      "input": "9f3f650bb9bdad26189038a69187e01f",
      "output": "d0c635e7e896d4c840b7760b414b64a8",
      "hmac": "e09eeee5d5ec50d3e2149cdcd0bf075e4539d05f5dfe07a4acdd53c5a91067297eb22e28af3d2d49dc6360809ae0ec069e33a86d7f2ecf4b85afe2e45cb298db"
    },
    {
      "input": "023997b27a7671dd4dbbd6be0d30e20f",
      "output": "693d93d6ea93f047a5f60538e0e328af",
      "hmac": "667e24152cba5464acbba7fac882feab9b400417d69dcd3c8e71dd336fdada73c48edb1defdd32272cca564522e9d80724994d5b70257fb92e9ec217b5c4d2e0"
    }
  ]
};

export const bloodSwordmasterCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: "Blood Swordmaster",
  name: "Blood Swordmaster",
  type: TYPE_ROBOT,
  cost: 2,
  spriteID: "hnawh0i9rzb",
  text: "Activate: Give a friendly robot +2 attack, then deal 3 damage to your kernel.",
  stats: {
    health: 1,
    speed: 3,
    attack: 3
  },
  abilities: [
    "(function () { setAbility(abilities['activated'](function () { return targets['thisRobot'](); }, \"(function () { (function () { actions['modifyAttribute'](targets['choose'](objectsMatchingConditions('robot', [conditions['controlledBy'](targets['self']())]), 1), 'attack', function (x) { return x + 2; }); })(); (function () { actions['dealDamage'](objectsMatchingConditions('kernel', [conditions['controlledBy'](targets['self']())]), 3); })(); })\")); })"
  ],
  integrity: [
    {
      "input": "d4a531f15b094354cbc4489f1f7b7882",
      "output": "09d85c1e67b66b635a73670e03dc2743",
      "hmac": "93ebb41274e288e64a8dceab39c218d814ac8e8cfd8936179a3db1e63106d8a01813abdedf31aab228c2b761a2062333ce460ba2487384c03110d2c922b0efb6"
    }
  ]
};

export const medicBotCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Medic Bot',
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
  ],
  integrity: [
    {
      "input": "0a1dff1f81bfbbaa53656957c5e7e3d0",
      "output": "2c6352740191ed11d60311ad2c36e4c6",
      "hmac": "3e7cca2f8bf590686774e3fcc52bd0ccbe271ab25da4447b6b41dd22f4067c8b20c9199e26632efaa528a427f512430938ccc1283120d2fc8ce63cce18fb2cbd"
    }
  ]
};

export const mercenaryBlacksmithCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: "Mercenary Blacksmith",
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
  ],
  integrity: [
    {
      "input": "3168d0c876cb54940738fdb5545277ca",
      "output": "41b32a406c8b24042ac16a4ec4d2438f",
      "hmac": "b2deefbf9110bd8bf460d6e5af03e8cd0bce610a4cf97ef8f570c3b00fd35a3b59f514b7e93509fbc211d3f72d92293871298ef29221b76fc4b1b64566e2ee9f"
    }
  ]
};

export const thornyBushCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Thorny Bush',
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
  ],
  integrity: crawlingWallCard.integrity
};

export const twoBotCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Two Bot',
  name: 'Two Bot',
  cost: 2,
  type: TYPE_ROBOT,
  stats: {
    attack: 2,
    health: 4,
    speed: 1
  },
  abilities: [],
  integrity: []
};

export const batteryBotCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Battery Bot',
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
  ],
  integrity: [
    {
      "input": "dfd1dd4e897a5ec4aa1734eaf20c15fd",
      "output": "b4b96e414b8476730bb56ce46aca2439",
      "hmac": "16d2cb2ce704f9a3f0f082dbb11e4bded8ac1923d9ddd2154cd8ccc4ecba391b8e27b249d0e15bd748f375a34e746687871632b2ee2461fce1c56cd005e1200d"
    }
  ]
};

export const governmentResearcherCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Government Researcher',
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
  ],
  integrity: [
    {
      "input": "6ae162b7224d8377b99170e4852a5a7c",
      "output": "79109becd17f46b2ea33e02397dd8e32",
      "hmac": "85127bcf02ecd8ee891c6c4b21dc75fbe2693a5070f4cafb8f31e65997b7416a2d77a0e539439c4cd99a13d9f89ebf5250637eaf98c4eb96a13f4f4279e75b1c"
    }
  ]
};

export const hermesCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: "Hermes",
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
  ],
  integrity: [
    {
      "input": "fdbee07b31e37af5e9a564bc4efef981",
      "output": "ecbb763dc5d57f7da655edeb894c3eba",
      "hmac": "1d03926adb78b58890b77c8fdd92f2920c60c47be3476fc1a62601c4f057d815f689555c06671ad1dcc70921781213034992c94ee72c7fb6e873ba15a9595d87"
    }
  ]
};

export const kernelEaterCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: "Kernel Eater",
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
  ],
  integrity: [
    {
      "input": "b87b300a05fe3c90c3255e4fd8a10d65",
      "output": "f77826562f992889cc7b5876b4668f0e",
      "hmac": "2ce7b927973b882c68711e40131db9af8e8a6eb68053cd07e88f35e562b3c3fa8b2b05571aa18d37dcc7897f5b678c21ec42083c1dc70fd446b0a0d9abc31a06"
    }
  ]
};

export const martyrBotCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Martyr Bot',
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
    "(function () { setTrigger(triggers['afterDestroyed'](function () { return targets['thisRobot'](); }, 'anyevent'), (function () { actions['takeControl'](targets['self'](), objectsMatchingConditions('robot', [conditions['adjacentTo'](targets['thisRobot']())])); })); })"
  ],
  integrity: [
    {
      "input": "da993aaf7aba87f1d80abf2ea13f707c",
      "output": "a0c15080c81c7feaf80dfbef11c0af0e",
      "hmac": "a5222e240400a2952fd00582e7d3728e73134715389bf0587752e5ccfc295bcdda389bbff465d24c4ac739590c50ae0b42b7c00d3e61365a2be7885bd94497b9"
    }
  ]
};

export const pacifistCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Pacifist',
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
  ],
  integrity: [
    {
      "input": "c371b095422b183a4627899dfaec4859",
      "output": "71a5a44d34ba5f0acaf57793e8368f9b",
      "hmac": "26f206059d78ea65e2ae03ffb681f17dbf36d2e696a1c011f35b4c2dc3f52294894e0b6fd39509f6cf0c7572058d10b4e9bee95acc28e2a30d2711768684b6e6"
    }
  ]
};

export const recklessBerserkerCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: "Reckless Berserker",
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
  ],
  integrity: [
    {
      "input": "9f3f650bb9bdad26189038a69187e01f",
      "output": "d0c635e7e896d4c840b7760b414b64a8",
      "hmac": "e09eeee5d5ec50d3e2149cdcd0bf075e4539d05f5dfe07a4acdd53c5a91067297eb22e28af3d2d49dc6360809ae0ec069e33a86d7f2ecf4b85afe2e45cb298db"
    }
  ]
};

export const recruiterBotCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Recruiter Bot',
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
    "(function () { setAbility(abilities['attributeAdjustment'](function () { return targets['all'](cardsInHand(targets['self'](), 'robot', [])); }, 'cost', function (x) { return x - 1; })); })"
  ],
  integrity: [
    {
      "input": "4b4d9dd7545e3564b3e404bd992256d4",
      "output": "14754e9b27f0a7ec97e28d96b396b6a8",
      "hmac": "46bb3f6886d9389d68195c1d1b1eeb8736353cf9565186c062f7de50b44cc4ece0875b28474d3a5ed4d78b081d8ec23d0a76ef4f1404ab6ead205c23b124e42e"
    }
  ]
};

export const recyclerCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: "Recycler",
  name: "Recycler",
  type: TYPE_ROBOT,
  spriteID: "rtom5g6o8yf",
  text: "Activate: Discard a card, then draw a card.",
  cost: 3,
  abilities: [
    "(function () { setAbility(abilities['activated'](function () { return targets['thisRobot'](); }, \"(function () { (function () { actions['discard'](targets['choose'](cardsInHand(targets['self'](), 'anycard', []), 1)); })(); (function () { actions['draw'](targets['self'](), 1); })(); })\")); })"
  ],
  stats: {
    attack: 1,
    health: 2,
    speed: 2
  },
  integrity: [
    {
      "input": "c94ad88176f4c0b85e0a03e03d3d731d",
      "output": "c399b468377be676877afa0180466d78",
      "hmac": "df7c7e790f704485d556e980cb56b779ef66b481d5a352e91bd0218d1b1fee4366a333083c054f786237d00153a04f87d3b1482a7b656ab2a206a3254ce0d0e7"
    }
  ]
};

export const redBotCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Red Bot',
  name: 'Red Bot',
  cost: 3,
  type: TYPE_ROBOT,
  stats: {
    attack: 3,
    health: 3,
    speed: 2
  },
  abilities: [],
  integrity: []
};

export const roboSlugCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: "Robo Slug",
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
  ],
  integrity: [
    {
      "input": "e3e4c4877adacf6ce7ffaddb2356f391",
      "output": "361c2d6f424b12ae0d57ed8030522657",
      "hmac": "322c3961706dd0b2247cdd1133a0f1e18bced226e3fecf7da64f401e04d30ed0eb05d07a85d1c64f5996f7bf8c112af6e3b04863df1eeaf89f330616e004bba0"
    }
  ]
};

export const bloodDonorCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Blood Donor',
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
  ],
  integrity: [
    {
      "input": "32c5baedad0a6039082cefdc58c32a44",
      "output": "457746d413fa028885734cc573a2bea9",
      "hmac": "e7404ef352cb6a2bd84e313f9f7bb7326dc15cec21959684f5797f94e03c2ba36971a45f85212010969c6982ad67baef6f139db911abebea935e6cf08ad509fa"
    }
  ]
};

export const blueBotCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Blue Bot',
  name: 'Blue Bot',
  cost: 4,
  type: TYPE_ROBOT,
  stats: {
    attack: 2,
    health: 8,
    speed: 1
  },
  abilities: [],
  integrity: []
};

export const defenderBotCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Defender Bot',
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
    "(function () { setAbility(abilities['applyEffect'](function () { return objectsMatchingConditions('robot', [conditions['adjacentTo'](targets['thisRobot']()), conditions['controlledBy'](targets['opponent']())]); }, 'canonlyattack', {target: targets['thisRobot']()})); })"
  ],
  integrity: [
    {
      "input": "30319e11c37cff50e2489e183e3bf629",
      "output": "2536d7249c0ce4f617b768f5748ff9b5",
      "hmac": "4b192fc8980968023fb7a10edf316a5bda4f36bed85c993b801313a09f4379bc0733748ecba75c5a38a8fbffbbbd7d84408fd8e81a922db56954b1642e43ee35"
    },
    {
      "input": "0c616229c1163efff573a2857f2f7eee",
      "output": "98fa8d56eb24bb205332843d7880f941",
      "hmac": "9d02993be89025f178af0b6b9b1afe86c6c93629dc0298ffb2872b04d73f8b24a83115a52b2deeed847dd6aefc94f39515762ca5b9db34d52935a35694bff2e2"
    }
  ]
};

export const energyHoarderCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: "Energy Hoarder",
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
    "(function () { setAbility(abilities['activated'](function () { return targets['thisRobot'](); }, \"(function () { (function () { actions['payEnergy'](targets['self'](), 3); })(); (function () { (function () { actions['discard'](targets['choose'](cardsInHand(targets['self'](), 'anycard', []), 1)); })(); (function () { (function () { save('target', targets['thisRobot']()); })(); (function () { actions['modifyAttribute'](load('target'), 'attack', function (x) { return x + 1; }); })(); (function () { actions['modifyAttribute'](load('target'), 'health', function (x) { return x + 1; }); })(); })(); })(); })\")); })"
  ],
  integrity: [
    {
      "input": "48790908919a4c555db9f1969dfd6715",
      "output": "b37d27ba6cf392b69a54be2faed48428",
      "hmac": "e5f08e9e6b6d87e77be83c029faa7952a5f1487694461e9f4450ea936813879af8d27e023122ba8dfc43a88d2154709bd9aea946c5f64b984351d29af9df5d64"
    }
  ]
};

export const friendlyRiotShieldCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Friendly Riot Shield',
  name: 'Friendly Riot Shield',
  cost: 2,
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
  ],
  integrity: [
    {
      "input": "30319e11c37cff50e2489e183e3bf629",
      "output": "2536d7249c0ce4f617b768f5748ff9b5",
      "hmac": "4b192fc8980968023fb7a10edf316a5bda4f36bed85c993b801313a09f4379bc0733748ecba75c5a38a8fbffbbbd7d84408fd8e81a922db56954b1642e43ee35"
    },
    {
      "input": "9f3f650bb9bdad26189038a69187e01f",
      "output": "d0c635e7e896d4c840b7760b414b64a8",
      "hmac": "e09eeee5d5ec50d3e2149cdcd0bf075e4539d05f5dfe07a4acdd53c5a91067297eb22e28af3d2d49dc6360809ae0ec069e33a86d7f2ecf4b85afe2e45cb298db"
    }
  ]
};

export const knowledgeBotCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Knowledge Bot',
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
  ],
  integrity: [
    {
      "input": "26cb47822589b8161757ef08f8c6f86f",
      "output": "7922f07f92cccccd0800fb9c086d8c62",
      "hmac": "6f8f0c866593e219fd84a2179d6d5f11165d43fda1e439ff5ca50ef02f198f2ab771a852e270ee12377ec4fa01bb590631d23725b6e8d6c4b722917e07de86c7"
    }
  ]
};

export const leapFrogBotCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Leap Frog Bot',
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
  ],
  integrity: [
    {
      "input": "6203d64b5c27a295cd27c6d58462981c",
      "output": "5a8c452c71b1b36cace0a6d65e6a0f5f",
      "hmac": "b71807fd5988a65e8a79b495c971808db8012565c68d61f197cab093d579faf164369fda3f6f7a97d3cc1d585650986f52114a57c8e616dbdaabc87179f3e13c"
    }
  ]
};

export const monkeyBotCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Monkey Bot',
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
    "(function () { setTrigger(triggers['afterAttack'](function () { return targets['thisRobot'](); }, 'allobjects'), (function () { actions['dealDamage'](objectsMatchingConditions('robot', [conditions['adjacentTo'](targets['thisRobot']())]), attributeValue(targets['thisRobot'](), 'attack')); }), {override: true}); })"
  ],
  integrity: [
    {
      "input": "441987aa1733c3e4393549c6b394980f",
      "output": "d6f71424c88ff21130202adf3f1eca14",
      "hmac": "de8d8490a319ab97866092abfc4c3c971378d9eeffaf617c5398414c0efb9b2333e5f88edb30035f56c390ebe29843ff97194db193432ac84a7eb16e9762dda9"
    }
  ]
};

export const calmMonkCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Calm Monk',
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
  ],
  integrity: [
    {
      "input": "36bc2cfa076ce8998bf2d5b766460db4",
      "output": "3f6daed32a3601fba91bdaa66ba2a3cd",
      "hmac": "a53e753cd39f0997e349ab62f04a0ab436178e2bff2a0fa35b9e725d0c84b765f41efb70dd03a419697796238b99a91561eac2b6914ce01f5f7a7bc89bd9cee5"
    }
  ]
};

export const royalGuardCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Royal Guard',
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
    "(function () { setAbility(abilities['applyEffect'](function () { return objectsMatchingConditions('robot', [conditions['adjacentTo'](targets['thisRobot']()), conditions['controlledBy'](targets['opponent']())]); }, 'canonlyattack', {target: targets['thisRobot']()})); })"
  ],
  integrity: [
    {
      "input": "30319e11c37cff50e2489e183e3bf629",
      "output": "2536d7249c0ce4f617b768f5748ff9b5",
      "hmac": "4b192fc8980968023fb7a10edf316a5bda4f36bed85c993b801313a09f4379bc0733748ecba75c5a38a8fbffbbbd7d84408fd8e81a922db56954b1642e43ee35"
    },
    {
      "input": "0c616229c1163efff573a2857f2f7eee",
      "output": "98fa8d56eb24bb205332843d7880f941",
      "hmac": "9d02993be89025f178af0b6b9b1afe86c6c93629dc0298ffb2872b04d73f8b24a83115a52b2deeed847dd6aefc94f39515762ca5b9db34d52935a35694bff2e2"
    }
  ]
};

export const botOfPainCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Bot of Pain',
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
    "(function () { setTrigger(triggers['endOfTurn'](function () { return targets['allPlayers'](); }), (function () { actions['dealDamage'](objectsMatchingConditions('robot', []), 1); })); })"
  ],
  integrity: [
    {
      "input": "c1626f77c6c6358a9d922dffacea2fd1",
      "output": "870dcae63b27ff099662c8a8060e9445",
      "hmac": "5090413927a27ff33a7b2a29f82d9490bae46e5145ce784b22107691f3272d32ae818918d4139a7a91cef71af981a6bcaa5dae8151508550e5e9725f14f1ac8e"
    }
  ]
};

export const flametongueBotCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Flametongue Bot',
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
    "(function () { setTrigger(triggers['afterPlayed'](function () { return targets['thisRobot'](); }), (function () { actions['dealDamage'](targets['choose'](objectsMatchingConditions('allobjects', []), 1), 4); })); })"
  ],
  integrity: [
    {
      "input": "bfa1cf6bc3e2d0fb62c8a32ae8053351",
      "output": "635029b9f442520be1b416341c5857c8",
      "hmac": "e85902727c53a605dc33e6c9d083f41433eeb475deda883133bc8132f7acf62b3f19d8732d290d222dd22649d824d62c60fe4788dc067fb411e5476abb5de31b"
    }
  ]
};

export const effectiveTrollCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Effective Troll',
  name: 'Effective Troll',
  cost: 7,
  type: TYPE_ROBOT,
  stats: {
    attack: 7,
    health: 7,
    speed: 2
  },
  abilities: [
  ],
  integrity: []
};

export const generalBotCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'General Bot',
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
    "(function () { setTrigger(triggers['afterPlayed'](function () { return targets['thisRobot'](); }), (function () { actions['canMoveAgain'](other(objectsMatchingConditions('robot', [conditions['controlledBy'](targets['self']())]))); })); })",
    "(function () { setAbility(abilities['attributeAdjustment'](function () { return objectsMatchingConditions('robot', [conditions['adjacentTo'](targets['thisRobot']())]); }, 'attack', function (x) { return x + 1; })); })"
  ],
  integrity: [
    {
      "input": "60f5eecc5fde0446c550c6c0225eab1a",
      "output": "e2f597307a723bab97343438fc59524c",
      "hmac": "38261cc5e448d8973579897aa438ca4d20254becbbf61ae40a0c50c2e84ed9700d544901dbcbf104310a99140e097fbd0bafcf1f76ccae11fc49cf82af7f62d0"
    },
    {
      "input": "f61614596adabd380f5dfe880e554570",
      "output": "cf179b4ad59269e666cc3075245ca5d3",
      "hmac": "d24e250324d0d936cecedd5cfac7010a85704626b55d8a8d8fe3fc5503830013c8629eeccd30c8b770110e973067a18f1d039b326d43092f80fc90aa3ac480f7"
    }
  ]
};
