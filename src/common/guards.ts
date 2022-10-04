// Type guards for intersection types.
// See https://www.typescriptlang.org/docs/handbook/advanced-types.html

import { isNil } from 'lodash';

import * as w from './types';

export function isObject(target: w.Targetable): target is w.Object {
  return !isNil(target) && (target as w.Object).card !== undefined;
}

export function isCardInGame(target: w.Targetable): target is w.CardInGame {
  return !isNil(target) && (target as w.CardInGame).baseCost !== undefined;
}

export function isPlayerState(target: w.Targetable): target is w.PlayerInGameState {
  return !isNil(target) && (target as w.PlayerInGameState).objectsOnBoard !== undefined;
}

export function isCardCollection(collection: w.Collection): collection is w.CardCollection {
  return collection.type === 'cards' || collection.type === 'cardsInDiscardPile';
}

export function isObjectCollection(collection: w.Collection): collection is w.ObjectCollection {
  return collection.type === 'objects';
}

export function isPlayerCollection(collection: w.Collection): collection is w.PlayerCollection {
  return collection.type === 'players';
}

export function isCardObfuscated(target: w.PossiblyObfuscatedCard): target is w.ObfuscatedCard {
  return (target as w.CardInGame).name === undefined;
}

export function isCardVisible(target: w.PossiblyObfuscatedCard): target is w.CardInGame {
  return (target as w.CardInGame).name !== undefined;
}

export function isPassiveAbility(ability: w.Ability): ability is w.PassiveAbility {
  return (ability as w.PassiveAbility).unapply !== undefined;
}
