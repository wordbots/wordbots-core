import { isNumber, size, sum } from 'lodash';

import * as w from '../types';
import { getAttribute } from '../util/game';

export function attributeSum(_: w.GameState): w.Returns<number> {
  return (
    targetObjects: w.ObjectCollection | ((state: w.GameState) => w.ObjectCollection),
    attribute: w.Attribute
  ): number => {
    const objects: w.Object[] = (targetObjects as w.ObjectCollection).entries;
    return sum(objects.map((obj) => getAttribute(obj, attribute)));
  };
}

export function attributeValue(_: w.GameState): w.Returns<number> {
  return (
    targetObjects: w.ObjectCollection | ((state: w.GameState) => w.ObjectCollection),
    attribute: w.Attribute
  ): number => {
    const object: w.Object | undefined = (targetObjects as w.ObjectCollection).entries[0]; // targetObjects is an array of objects, so unpack.
    return object && getAttribute(object, attribute) || 0;
  };
}

export function count(_: w.GameState): w.Returns<number> {
  return (collection: w.Collection) => size(collection.entries);
}

export function energyAmount(_: w.GameState): w.Returns<number> {
  return (players: w.PlayerCollection) => players.entries[0].energy.available;
}

export function maximumEnergyAmount(_: w.GameState): w.Returns<number> {
  return (players: w.PlayerCollection) => players.entries[0].energy.total;
}

export function thatMuch(state: w.GameState): w.Returns<number> {
  return () => {
    const amount = state.memory['amount'];
    if (amount && isNumber(amount)) {
      return amount;
    } else {
      /* istanbul ignore next: this is a fallback that should be rarely hit */
      throw new Error("Can't resolve thatMuch() because there is no salient amount");
    }
  };
}
