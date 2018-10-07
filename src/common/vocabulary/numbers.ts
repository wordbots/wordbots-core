import { isFunction, size, sum } from 'lodash';

import * as w from '../types';
import { getAttribute } from '../util/game';

export function attributeSum(_: w.GameState): w.Returns<number | ((state: w.GameState) => number)> {
  const compute = (
    targetObjects: w.ObjectCollection | ((state: w.GameState) => w.ObjectCollection),
    attribute: w.Attribute
  ): number | ((state: w.GameState) => number) => {
    // Handle wrapped targets (see targets.they).
    if (isFunction(targetObjects)) {
      return (currentState: w.GameState) => (
        compute(targetObjects(currentState) as w.ObjectCollection, attribute) as number
      );
    } else {
      const objects: w.Object[] = (targetObjects as w.ObjectCollection).entries;
      return sum(objects.map((obj) => getAttribute(obj, attribute)));
    }
  };

  return compute;
}

export function attributeValue(_: w.GameState): w.Returns<number | ((state: w.GameState) => number)> {
  const compute = (
    targetObjects: w.ObjectCollection | ((state: w.GameState) => w.ObjectCollection),
    attribute: w.Attribute
  ): number | ((state: w.GameState) => number) => {
    // Handle wrapped targets (see targets.they).
    if (isFunction(targetObjects)) {
      return (currentState: w.GameState) => (
        compute(targetObjects(currentState) as w.ObjectCollection, attribute) as number
      );
    } else {
      const object: w.Object | undefined = (targetObjects as w.ObjectCollection).entries[0]; // targetObjects is an array of objects, so unpack.
      return object ? getAttribute(object, attribute)! : 0;
    }
  };

  return compute;
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
