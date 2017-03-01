import { capitalize, invert } from 'lodash';

export const STARTING_PLAYER_HEALTH = 20;

export const BLUE_CORE_HEX = '-4,0,4';
export const ORANGE_CORE_HEX = '4,0,-4';

export const TYPE_ROBOT = 0;
export const TYPE_EVENT = 1;
export const TYPE_CORE = 2;
export const TYPE_STRUCTURE = 3;

export const CREATABLE_TYPES = [TYPE_ROBOT, TYPE_EVENT, TYPE_STRUCTURE];

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
