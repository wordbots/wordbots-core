// Type guards for intersection types.
// See https://www.typescriptlang.org/docs/handbook/advanced-types.html

import { isNil } from 'lodash';

import * as w from './types';

export function isObject(target: w.Targetable): target is w.Object {
  return !isNil(target) && (target as w.Object).card !== undefined;
}

export function isPlayerState(target: w.Targetable): target is w.PlayerInGameState {
  return !isNil(target) && (target as w.PlayerInGameState).robotsOnBoard !== undefined;
}

export function isObjectCollection(collection: w.Collection): collection is w.ObjectCollection {
  const entries = collection.entries as w.Object[];
  return entries.every(isObject);
}

export function isCardObfuscated(target: w.PossiblyObfuscatedCard): target is w.ObfuscatedCard {
  return (target as w.CardInGame).name === undefined;
}

export function isPassiveAbility(ability: w.Ability): ability is w.PassiveAbility {
  return (ability as w.PassiveAbility).unapply !== undefined;
}
