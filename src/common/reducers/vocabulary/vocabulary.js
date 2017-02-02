import actions from './actions';
import targets from './targets';
import conditions from './conditions';
import { objectsInPlay, objectsMatchingCondition } from './collections';

const vocabulary = {
  actions: actions,
  targets: targets,
  conditions: conditions,

  // Global methods
  objectsInPlay: objectsInPlay,
  objectsMatchingCondition: objectsMatchingCondition
};

export default vocabulary;
