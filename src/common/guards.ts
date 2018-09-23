// Type guards for intersection types.
// See https://www.typescriptlang.org/docs/handbook/advanced-types.html

import * as w from './types';

export function isObject(target: w.Targetable): target is w.Object {
  return (target as w.Object).card !== undefined;
}

export function isPlayerState(target: w.Targetable): target is w.PlayerInGameState {
  return (target as w.PlayerInGameState).robotsOnBoard !== undefined;
}

export function isCardObfuscated(target: w.PossiblyObfuscatedCard): target is w.ObfuscatedCard {
  return (target as w.CardInGame).name === undefined;
}

export function isPassiveAbility(ability: w.Ability): ability is w.PassiveAbility {
  return (ability as w.PassiveAbility).unapply !== undefined;
}
