import * as cards from './cards';

function createDeck(cardCounts) {
  const deck = [];
  cardCounts.forEach(([card, num]) => {
    deck.push(...new Array(num).fill(card));
  });
  return deck;
}

export const aggro = createDeck([
  // Robots (22)
  [cards.speedyBotCard, 2],
  [cards.dojoDiscipleCard, 2],
  [cards.mercenaryBlacksmithCard, 2],
  [cards.bloodSwordmasterCard, 2],
  [cards.roboSlugCard, 2],
  [cards.martyrBotCard, 1],
  [cards.recklessBerserkerCard, 2],
  [cards.kernelEaterCard, 2],
  [cards.hermesCard, 1],
  [cards.recruiterBotCard, 1],
  [cards.energyHoarderCard, 2],
  [cards.leapFrogBotCard, 2],
  [cards.generalBotCard, 1],

  // Events (8)
  [cards.gustOfWindCard, 2],
  [cards.concentrationCard, 2],
  [cards.rampageCard, 2],
  [cards.shockCard, 2]
]);

export const healing = createDeck([
  // Robots (17)
  [cards.crawlingWallCard, 1],
  [cards.thornyBushCard, 2],
  [cards.medicBotCard, 2],
  [cards.governmentResearcherCard, 2],
  [cards.pacifistCard, 1],
  [cards.defenderBotCard, 2],
  [cards.friendlyRiotShieldCard, 1],
  [cards.bloodDonorCard, 2],
  [cards.royalGuardCard, 2],
  [cards.calmMonkCard, 1],
  [cards.effectiveTrollCard, 1],

  // Events (10)
  [cards.concentrationCard, 2],
  [cards.vampirePotionCard, 1],
  [cards.equalizeCard, 2],
  [cards.designatedSurvivorCard, 2],
  [cards.greatSimplificationCard, 2],
  [cards.explosiveBoostCard, 1],

  // Structures (3)
  [cards.energyWellCard, 1],
  [cards.mirrorCard, 1],
  [cards.healingWellCard, 1]
]);
