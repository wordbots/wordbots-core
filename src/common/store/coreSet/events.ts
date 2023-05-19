import { TYPE_EVENT } from '../../constants';
import * as w from '../../types';

export const incinerateCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Incinerate',
  name: 'Incinerate',
  text: 'Gain energy equal to the total power of robots you control. Destroy all robots you control.',
  command: [
    "(function () { actions['modifyEnergy'](targets['self'](), function (x) { return x + attributeSum(objectsMatchingConditions('robot', [conditions['controlledBy'](targets['self']())]), 'attack'); }); })",
    "(function () { actions['destroy'](objectsMatchingConditions('robot', [conditions['controlledBy'](targets['self']())])); })"
  ],
  cost: 0,
  type: TYPE_EVENT,
  integrity: [
    {
      "input": "ae6ac2aecf9b4840c919c394924d0325",
      "output": "7e4fc4e07067bd0ace8530632dc1dcef",
      "hmac": "986a8f3ea60a85bbf6e1d5b0c54c5720bce3d4103e8a52f999d03e2c694778cd78908054596ce4d7e18b97dd33b845c600f8f201421a188b7ab3335e5d4ffc45"
    },
    {
      "input": "41b11ad9531c6943ff3e821e5a1032a4",
      "output": "e73dbbc109640bef751c1f45f048df6d",
      "hmac": "1b6a80a1c9dffbb5bec77f9d60520dd302e77dc144ee870d5b5fc6da92dc4c742fa9b15880e5696bbd39928198476e7fa6b45c6dc4bcd4f5b71d4947ee9f48a0"
    }
  ]
};

export const superchargeCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Supercharge',
  name: 'Supercharge',
  text: 'Gain 2 energy.',
  command: "(function () { actions['modifyEnergy'](targets['self'](), function (x) { return x + 2; }); })",
  cost: 0,
  type: TYPE_EVENT,
  integrity: [
    {
      "input": "42024a4bcac077b548b8c75d6451fcfd",
      "output": "76c8b0ed05930b2e17b74bb8cf8a0523",
      "hmac": "423db2b5553f84105c751952c6f14f25155066503346d2ae04494b64197dd41a2e3d62afcc83744a1f49406eda05a18bd6ab07a36aa1f49a08424a7f1ceda867"
    }
  ]
};

export const concentrationCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Concentration',
  name: 'Concentration',
  text: 'Draw 2 cards.',
  command: "(function () { actions['draw'](targets['self'](), 2); })",
  cost: 2,
  type: TYPE_EVENT,
  integrity: [
    {
      "input": "88fcf9b23b291f41989d58dc70499a29",
      "output": "239c03a3a5946ddbc4279b00e283f661",
      "hmac": "bc11942bca75220af336c3344f2966a91b96a9b99d7830958f10bd60c426f032d0bc534634eb8c23b66b400759f05a02825ff4502b593c12342976cf68fb77d3"
    }
  ]
};

export const consumeCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Consume',
  name: 'Consume',
  text: 'Discard a robot card. Gain life equal to its health.',
  command: [
    "(function () { actions['discard'](targets['choose'](cardsInHand(targets['self'](), 'robot', []), 1)); })",
    "(function () { actions['modifyAttribute'](objectsMatchingConditions('kernel', [conditions['controlledBy'](targets['self']())]), 'health', function (x) { return x + attributeValue(targets['it'](), 'health'); }); })"
  ],
  cost: 2,
  type: TYPE_EVENT,
  integrity: [
    {
      "input": "7491afb7baff323907ed66f85c0a46a0",
      "output": "6ee5b760506048b24a719b697910a426",
      "hmac": "d701935800b6892155f14ee073676c2729a79867e8b354fe59ae0493140cf0d3acdf53cafb76789a57d455b509240da8e4a8b49590c1663530002e778c4d37f7"
    },
    {
      "input": "92e2226d37676f2436c0b737927d6373",
      "output": "dcca5dbea94d90a880b440d8fca8b18d",
      "hmac": "ebc8ebf6b2110f2d0dcbcdfd3fa6a26a8fa58f679c33d396695302bc649a890746e5843f2a89cef8c6b63a079e5bde452507270008e0be1d851b9d5f04976b57"
    }
  ]
};

export const gustOfWindCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Gust of Wind',
  name: 'Gust of Wind',
  text: 'Move a robot up to 2 spaces.',
  command: "(function () { (function () { save('target', targets['choose'](objectsMatchingConditions('robot', []), 1)); })(); (function () { actions['moveObject'](load('target'), function () { return targets['choose'](tilesMatchingConditions([conditions['withinDistanceOf'](2, load('target')), conditions['unoccupied']()]), 1); }); })(); })",
  cost: 2,
  type: TYPE_EVENT,
  integrity: [
    {
      "input": "438b996c342396cb9aa4e23230e081c9",
      "output": "e755eef82f5a8e3b1566bd0053355f4e",
      "hmac": "37bceb4a1daf00d09374fe94980d2aef23cbb18bb57f433fe155777240bd0f60923cd3df891d8a2b6cb7e89ca68bce31371d621b82d068018ba3d2da430eb4bb"
    },
  ]
};

export const smashCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Smash',
  name: "Smash",
  type: TYPE_EVENT,
  text: "Destroy a structure.",
  cost: 2,
  command: [
    "(function () { actions['destroy'](targets['choose'](objectsMatchingConditions('structure', []), 1)); })"
  ],
  integrity: [
    {
      "input": "a8ad4feba2e1aff6cde164ddf183a91a",
      "output": "3f32f3ce114dba275544b9127dd19016",
      "hmac": "8ea17c2e66559da9ed8831db7685d75f7a1d674d3abcb0bc41b582808277937dec9bca97ce72ae2ef161db573b62a8c543780951198d7ffe03c9ae509bc0df4d"
    }
  ]
};

export const vampirePotionCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Vampire Potion',
  name: 'Vampire Potion',
  text: 'Give a robot "When this robot attacks, restore 3 health to your kernel"',
  command: "(function () { actions['giveAbility'](targets['choose'](objectsMatchingConditions('robot', []), 1), \"(function () { setTrigger(triggers['afterAttack'](function () { return targets['thisRobot'](); }, 'allobjects'), (function () { actions['restoreHealth'](objectsMatchingConditions('kernel', [conditions['controlledBy'](targets['self']())]), 3); })); })\"); })",
  cost: 2,
  type: TYPE_EVENT,
  integrity: [
    {
      "input": "4339b16d5c21b23048c8af093bac87d9",
      "output": "ff9284ae0b8f6e331cd32e3a8188c35c",
      "hmac": "10024290d095d6cf3fd7bce8c7b909881b4d1cdfc45933ec403c8a4fcb7a28757db9d909c6d77ca644f31c23344a92c26daf9b8c496f165c8b1377031c34c711"
    }
  ]
};

export const designatedSurvivorCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Designated Survivor',
  name: 'Designated Survivor',
  text: 'Double a robot\'s health',
  command: "(function () { actions['modifyAttribute'](targets['choose'](objectsMatchingConditions('robot', []), 1), 'health', function (x) { return x * 2; }); })",
  cost: 3,
  type: TYPE_EVENT,
  integrity: [
    {
      "input": "dad65932849dfcd788d4f8ed0f5d944f",
      "output": "61210b87dac522f40e68ee41831267bc",
      "hmac": "f9a2bc32403ff0556f6c122f52111f737f568c253f6f175e865cf17cd7b8fc78aeba032619351bd6e05d4a7249919b20c6a808b069898d259d6e8238ce79f10a"
    }
  ]
};

export const discountCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Discount',
  name: 'Discount',
  text: 'Reduce the cost of all cards in your hand by 1.',
  command: "(function () { actions['modifyAttribute'](targets['all'](cardsInHand(targets['self'](), 'anycard', [])), 'cost', function (x) { return x - 1; }); })",
  cost: 3,
  type: TYPE_EVENT,
  integrity: [
    {
      "input": "e3a7a125fb32bd3f54e3495737c3e2eb",
      "output": "9f0bc702964c1f21b00f193f5f90e0fc",
      "hmac": "83a3223bc3cf6e5d851a329b40f97ab7fa622a5664a62f5e0fa2a905d10daec9e4be07fdcb33228263acac49c001c2aedd16496dd0d584832423aca6df8fd9a1"
    }
  ]
};

export const equalizeCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Equalize',
  name: 'Equalize',
  text: 'Set the attack of all robots equal to their health',
  command: "(function () { actions['setAttribute'](objectsMatchingConditions('robot', []), 'attack', \"(function () { return attributeValue(targets['they'](), 'health'); })\"); })",
  cost: 3,
  type: TYPE_EVENT,
  integrity: [
    {
      "input": "14613194d2553a756729b2fdaacb3b53",
      "output": "b91b1391d958d2dbdca0ff03f923f459",
      "hmac": "02ff87222ddd84306dd74951caa41c04fd046b2ab8e7526a9e9e84b1a395a8d04afbbc0131daee7b9a091baa567aacdd8d3d88855ce048e1c8a47cc2c3142d84"
    }
  ]
};

export const firestormCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Firestorm',
  name: 'Firestorm',
  text: 'Deal 1 damage to everything adjacent to a tile.',
  command: "(function () { actions['dealDamage'](objectsMatchingConditions('allobjects', [conditions['adjacentTo'](targets['choose'](allTiles(), 1))]), 1); })",
  cost: 3,
  type: TYPE_EVENT,
  integrity: [
    {
      "input": "be61239012c5b03f80aed3697037a670",
      "output": "db0309f342be29e9cd36032814e3382b",
      "hmac": "24f6d6307d35c310dfdf67e7412a96febdc0115d8a76551a095476c2bed357a80f8f84b262ae7c458ad6db8efd48dcd150067c51ce9fd3ace29f44b0a25d6f5a"
    }
  ]
};

export const rampageCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Rampage',
  name: 'Rampage',
  text: 'Give all robots you control +2 attack.',
  command: "(function () { actions['modifyAttribute'](objectsMatchingConditions('robot', [conditions['controlledBy'](targets['self']())]), 'attack', function (x) { return x + 2; }); })",
  cost: 3,
  type: TYPE_EVENT,
  integrity: [
    {
      "input": "75c2daaf1ee4c88518ed466dd302350a",
      "output": "ab2dbf78de29cb13f3b12ef93e286d58",
      "hmac": "0ae0907d2316d0d537400d20c165633af9491967d5a180c8a5db02274333126b85d2eb645319a1864ca6bedb5bf719f73c83c54f57c812df4d4cea58c2f8dca8"
    }
  ]
};

export const shockCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Shock',
  name: 'Shock',
  text: 'Deal 3 damage to a robot.',
  command: "(function () { actions['dealDamage'](targets['choose'](objectsMatchingConditions('robot', []), 1), 3); })",
  cost: 3,
  type: TYPE_EVENT,
  integrity: [
    {
      "input": "7b48b95142acc2367bde19d912878d91",
      "output": "0c285e14053756672a2babff195fb56b",
      "hmac": "7a52f2e8f3471735708655e71e7592a99c1752055995e1f2a27f15203ae55abf6b08e2b07dab7ef251742e93eb49c42e04b34f430e5b651d17ec4a959f375aea"
    }
  ]
};

export const missileStrikeCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Missile Strike',
  name: 'Missile Strike',
  text: 'Deal 4 damage to your opponent.',
  command: "(function () { actions['dealDamage'](targets['opponent'](), 4); })",
  cost: 4,
  type: TYPE_EVENT,
  integrity: [
    {
      "input": "bbdeb9ff72e5f9a82cbe730884f9c66d",
      "output": "6efe3eb7c40e39c49752204e49430ed0",
      "hmac": "75b7e5de387b1c7f2cadb7e816b428049f1ffe779acd5bcd2558cbc0a5276e2c542bd72c3a63efc2f9cd0bebdc85f9b434d510e634b40208e7eac102d0ae0018"
    }
  ]
};

export const threedomCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Threedom',
  name: 'Threedom',
  text: 'Set all stats of all robots in play to 3.',
  command: "(function () { actions['setAttribute'](objectsMatchingConditions('robot', []), 'allattributes', \"(function () { return 3; })\"); })",
  cost: 4,
  type: TYPE_EVENT,
  integrity: [
    {
      "input": "e4f585ac2543068b5b58f9405f49a7b4",
      "output": "71c298e922a7189d6cf4f32aa13221e8",
      "hmac": "a3e166324b82da555dc3a03b7676db6d21e199d07657f2cdc5d01a05fd0a1c24c4c90892a5e8d4b40eaf9c1259a6162cb49633bf92fd53701c319dd08da8bbcf"
    }
  ]
};

export const wisdomCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Wisdom',
  name: 'Wisdom',
  text: 'Draw cards equal to the number of robots you control.',
  command: "(function () { actions['draw'](targets['self'](), count(objectsMatchingConditions('robot', [conditions['controlledBy'](targets['self']())]))); })",
  cost: 4,
  type: TYPE_EVENT,
  integrity: [
    {
      "input": "70a766403f08a20ed94eb36518a096c8",
      "output": "ccc9851730dd973ff3c04773129b9e26",
      "hmac": "65de19008a0686714335f70b971e9fc93a5189047926a96bdea52ebf02de594c98d22aa116f0b3172cd1e401e42c4d71a368f1b2929de614f8af07d2c7ea8017"
    }
  ]
};

export const earthquakeCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Earthquake',
  name: 'Earthquake',
  text: 'Destroy all robots that have less than 2 speed.',
  command: "(function () { actions['destroy'](objectsMatchingConditions('robot', [conditions['attributeComparison']('speed', (function (x) { return x < 2; }))])); })",
  cost: 5,
  type: TYPE_EVENT,
  integrity: [
    {
      "input": "898b59f78eaa2379ca980981fcd8d6f3",
      "output": "545f8b999b284d18987b59c011f8866f",
      "hmac": "b397802660cfc76a36208d32189deb8e45e984d8295eff5baefec9b7b5f89618dc015d9bd5742e09a2f331dd50a203734c1f924484443b238a8cbb8f9cc87aed"
    }
  ]
};

export const greatSimplificationCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Great Simplification',
  name: 'Great Simplification',
  text: 'Remove all abilities from all robots',
  command: "(function () { actions['removeAllAbilities'](objectsMatchingConditions('robot', [])); })",
  cost: 5,
  type: TYPE_EVENT,
  integrity: [
    {
      "input": "ef1654e8d0b207db48366ced086f5a3b",
      "output": "6a9ea7dcbe921f072577c707a92d03e0",
      "hmac": "360e660416eaae968317dbeb91ebe11277dd5408bbe807e91c183a99ef4990d073c178b601650be87881adf0e198a0913edee8e6a026038efd48f2d2ca8a7dd5"
    }
  ]
};

export const empCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'EMP',
  name: 'EMP',
  text: 'Set the attack and speed of all robots to 0. \nGive all robots "Activate: Destroy this robot".',
  command: [
    "(function () { actions['setAttribute'](objectsMatchingConditions('robot', []), ['attack', 'speed'], \"(function () { return 0; })\"); })",
    "(function () { actions['giveAbility'](objectsMatchingConditions('robot', []), \"(function () { setAbility(abilities['activated'](function () { return targets['thisRobot'](); }, \\\"(function () { actions['destroy'](targets['thisRobot']()); })\\\")); })\"); })"
  ],
  cost: 7,
  type: TYPE_EVENT,
  integrity: [
    {
      "input": "444d83b1398cb7682a4c17f7bb8e5e4a",
      "output": "796648c3ac66aeb99c33c6a6a7db95bc",
      "hmac": "db0cc9db6491508968c735d56de77545a4fd2715e69a7d987f717c1c19d3cd0ca2ab3fc49cc51eb861667b3dda6de5710eba2e96cea36d1be63471957236e272"
    },
    {
      "input": "1f724062eb7e1f7c39753e20e6db9c8f",
      "output": "ee71c8c95effc14ba87ad55d07df5105",
      "hmac": "1695985476c10e50e91bcb449251a8edd7e66d56764db8e94af633071367c6d7f81f3ed4618cd13cfb2a5a18c8455e16a2fe7b248297f5fed97870b4ba3e5713"
    }
  ]
};

export const explosiveBoostCard: w.CardInStore = {
  metadata: { source: { type: 'builtin' } as w.CardSource },
  id: 'Explosive Boost',
  name: 'Explosive Boost',
  text: 'Give your robots +2 attack and +2 health. Deal 1 damage to each enemy object',
  command: [
    "(function () { (function () { save('target', objectsMatchingConditions('robot', [conditions['controlledBy'](targets['self']())])); })(); (function () { actions['modifyAttribute'](load('target'), 'attack', function (x) { return x + 2; }); })(); (function () { actions['modifyAttribute'](load('target'), 'health', function (x) { return x + 2; }); })(); })",
    "(function () { actions['dealDamage'](objectsMatchingConditions('allobjects', [conditions['controlledBy'](targets['opponent']())]), 1); })"
  ],
  cost: 8,
  type: TYPE_EVENT,
  integrity: [
    {
      "input": "055ca37ecc6c8cad5e5f23c083996728",
      "output": "968c2e2492a5414c9944ac95c4635669",
      "hmac": "f65da981b3854ce6c1f950f942979282fdfbd69e59d9f84989f992d0fe9fa960e31be50fad7345df207dfdadcd4d42fa26fd21cefd97e8d908216fe5e9b00e43"
    },
    {
      "input": "a22260f5e695d34b092239e10faaa16d",
      "output": "4220ca0e94f843471b1ea9601f68befd",
      "hmac": "f89087e80d388ee73a6a462fb6dba77a3e3329211151c250ba19903df17c7c4f19dd381d1ca340e9db75d854119749da4a4e72c8f66fb985245ae47663eb13f8"
    }
  ]
};
