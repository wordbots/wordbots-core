import { size, sum } from 'lodash';

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
    return object ? getAttribute(object, attribute)! : 0;
  };
}

export function count(_: w.GameState): w.Returns<number> {
  return (collection: w.Collection) => {
    return size(collection.entries);
  };
}

export function energyAmount(_: w.GameState): w.Returns<number> {
  return (player: w.PlayerInGameState) => {
    return player.energy.available;
  };
}
