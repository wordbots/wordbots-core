import * as w from '../types';

import actions from './actions';
import targets from './targets';
import { objectConditions, globalConditions } from './conditions';
import { setTrigger, unsetTrigger, triggers } from './triggers';
import { setAbility, unsetAbility, abilities } from './abilities';
import {
  allTiles, cardsInHand, objectsInPlay, objectsMatchingConditions,
  other, tilesMatchingConditions
} from './collections';
import { attributeSum, attributeValue, count, energyAmount } from './numbers';

export default function vocabulary(
  state: w.GameState,
  currentObject: w.Object | null = null,
  source: w.Object | null = null
): Record<string, w.Returns<void> | Record<string, w.Returns<void>>> {
  return {
    actions: actions(state),
    targets: targets(state, currentObject),
    conditions: objectConditions(state),
    globalConditions: globalConditions(state),
    triggers: triggers(state),
    abilities: abilities(state),

    // Global methods:

    // Set/unset triggers + abilities
    setTrigger: setTrigger(state, currentObject, source),
    unsetTrigger: unsetTrigger(state, currentObject, source),
    setAbility: setAbility(state, currentObject, source),
    unsetAbility: unsetAbility(state, currentObject, source),

    // Collections
    allTiles: allTiles(state),
    cardsInHand: cardsInHand(state),
    objectsInPlay: objectsInPlay(state),
    objectsMatchingConditions: objectsMatchingConditions(state),
    other: other(state, currentObject),
    tilesMatchingConditions: tilesMatchingConditions(state),

    // Quantities
    attributeSum: attributeSum(state),
    attributeValue: attributeValue(state),
    count: count(state),
    energyAmount: energyAmount(state),

    // Utility methods
    save: (key, value) => { state.memory[key] = value; },
    load: (key) => state.memory[key]
  };
}
