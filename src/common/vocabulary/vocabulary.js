import actions from './actions';
import targets from './targets';
import conditions from './conditions';
import { setTrigger, unsetTrigger, triggers } from './triggers';
import { setAbility, unsetAbility, abilities } from './abilities';
import { allTiles, cardsInHand, objectsInPlay, objectsMatchingConditions } from './collections';
import { attributeSum, attributeValue, count } from './numbers';

const vocabulary = {
  actions: actions,
  targets: targets,
  conditions: conditions,
  triggers: triggers,
  abilities: abilities,

  // Global methods

  setTrigger: setTrigger,
  unsetTrigger: unsetTrigger,
  setAbility: setAbility,
  unsetAbility: unsetAbility,

  allTiles: allTiles,
  cardsInHand: cardsInHand,
  objectsInPlay: objectsInPlay,
  objectsMatchingConditions: objectsMatchingConditions,

  attributeSum: attributeSum,
  attributeValue: attributeValue,
  count: count
};

export default vocabulary;
