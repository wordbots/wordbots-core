import * as w from '../types';

import { abilities, setAbility, unsetAbility } from './abilities';
import actions from './actions';
import {
  allTiles, cardsInDiscardPile, cardsInHand, objectsInPlay, objectsMatchingConditions,
  other, tilesMatchingConditions
} from './collections';
import { globalConditions, objectConditions } from './conditions';
import { attributeSum, attributeValue, count, energyAmount, maximumEnergyAmount, numberOfObjectsDestroyedThisTurn, thatMuch } from './numbers';
import targets from './targets';
import { setTrigger, triggers, unsetTrigger } from './triggers';

export default function vocabulary(
  state: w.GameState,
  currentObject: w.Object | null = null,
  itOverride: w.Object | null = null,
  source: w.AbilityId | null = null
): Record<string, w.Returns<void> | Record<string, w.Returns<void>>> {
  return {
    actions: actions(state, currentObject),
    targets: targets(state, currentObject, itOverride),
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
    cardsInDiscardPile: cardsInDiscardPile(state),
    objectsInPlay: objectsInPlay(state),
    objectsMatchingConditions: objectsMatchingConditions(state),
    other: other(state, currentObject),
    tilesMatchingConditions: tilesMatchingConditions(state),

    // Quantities
    attributeSum: attributeSum(state),
    attributeValue: attributeValue(state),
    count: count(state),
    energyAmount: energyAmount(state),
    maximumEnergyAmount: maximumEnergyAmount(state),
    numberOfObjectsDestroyedThisTurn: numberOfObjectsDestroyedThisTurn(state),
    thatMuch: thatMuch(state),

    // Utility methods
    save: (key, value) => { state.memory[key] = value; },
    load: (key) => state.memory[key]
  };
}
