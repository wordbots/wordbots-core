import { STARTING_PLAYER_HEALTH, TYPE_CORE } from '../constants';

import * as robots from './coreSet/robots';
import * as events from './coreSet/events';
import * as structures from './coreSet/structures';

export * from './coreSet/robots';
export * from './coreSet/events';
export * from './coreSet/structures';

export const blueCoreCard = {
  name: 'Blue Kernel',
  img: 'core_blue',
  cost: 0,
  type: TYPE_CORE,
  stats: {
    health: STARTING_PLAYER_HEALTH
  },
  abilities: [],
  source: 'builtin'
};

export const orangeCoreCard = {
  name: 'Orange Kernel',
  img: 'core_orange',
  cost: 0,
  type: TYPE_CORE,
  stats: {
    health: STARTING_PLAYER_HEALTH
  },
  abilities: [],
  source: 'builtin'
};

export const collection = [
  ...Object.values(robots),
  ...Object.values(events),
  ...Object.values(structures)
].map(card =>
  Object.assign(card, {
    id: `builtin/${card.name}`,
    baseCost: card.cost,
    source: 'builtin'
  })
);

export const builtinCardNames = collection.map(card => card.name);
