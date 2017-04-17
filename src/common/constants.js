import { capitalize, invert } from 'lodash';

// Debug flags.
export const ALWAYS_ENABLE_DEV_TOOLS = true;
export const LOG_SOCKET_IO = false;
export const KEEP_DECKS_UNSHUFFLED = false;

export const STARTING_PLAYER_HEALTH = 20;

export const BLUE_CORE_HEX = '-3,0,3';
export const ORANGE_CORE_HEX = '3,0,-3';

export const TYPE_ROBOT = 0;
export const TYPE_EVENT = 1;
export const TYPE_CORE = 2;
export const TYPE_STRUCTURE = 3;

export const CREATABLE_TYPES = [TYPE_ROBOT, TYPE_EVENT, TYPE_STRUCTURE];

export const GRID_CONFIG = {
  width: 600, height: 600,
  layout: { width: 6, height: 6, flat: false, spacing: 0 },
  origin: { x: 0, y: 0 },
  map: 'hexagon',
  mapProps: [ 3 ]
};

const typeToStringMapping = {
  [TYPE_ROBOT]: 'robot',
  [TYPE_EVENT]: 'event',
  [TYPE_CORE]: 'kernel',
  [TYPE_STRUCTURE]: 'structure'
};

export function typeToString(type) {
  return capitalize(typeToStringMapping[type]);
}

export function stringToType(str) {
  return parseInt(invert(typeToStringMapping)[str.toLowerCase()]);
}
