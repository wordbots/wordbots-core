import actions from './actions';
import targets from './targets';
import conditions from './conditions';
import { setTrigger, triggers } from './triggers';
import { setAbility, abilities } from './abilities';
import { allTiles, cardsInHand, cardsInHandOfType, objectsInPlay, objectsMatchingCondition, objectsMatchingConditions } from './collections';
import { attributeSum, attributeValue, count } from './numbers';

const vocabulary = {
  actions: actions,
  targets: targets,
  conditions: conditions,
  triggers: triggers,
  abilities: abilities,

  // Global methods

  setTrigger: setTrigger,
  setAbility: setAbility,

  allTiles: allTiles,
  cardsInHand: cardsInHand,
  objectsInPlay: objectsInPlay,
  cardsInHandOfType: cardsInHandOfType,
  objectsMatchingCondition: objectsMatchingCondition,
  objectsMatchingConditions: objectsMatchingConditions,

  attributeSum: attributeSum,
  attributeValue: attributeValue,
  count: count
};

export default vocabulary;
