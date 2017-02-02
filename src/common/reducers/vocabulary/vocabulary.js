import actions from './actions';
import targets from './targets';
import conditions from './conditions';
import { cardsInHand, objectsInPlay, objectsMatchingCondition } from './collections';
import { attributeSum } from './numbers';

const vocabulary = {
  actions: actions,
  targets: targets,
  conditions: conditions,

  // Global methods
  cardsInHand: cardsInHand,
  objectsInPlay: objectsInPlay,
  objectsMatchingCondition: objectsMatchingCondition,
  attributeSum: attributeSum
};

export default vocabulary;
