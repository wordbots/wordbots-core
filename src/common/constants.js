export const STARTING_PLAYER_HEALTH = 20;

export const TYPE_ROBOT = 0;
export const TYPE_EVENT = 1;
export const TYPE_CORE = 2;
export const TYPE_STRUCTURE = 3;

const typeToStringMapping = {
  [TYPE_ROBOT]: 'robot',
  [TYPE_EVENT]: 'event',
  [TYPE_CORE]: 'kernel',
  [TYPE_STRUCTURE]: 'structure'
};

export function typeToString(type) {
  return _.capitalize(typeToStringMapping[type]);
}

export function stringToType(str) {
  return parseInt(_.invert(typeToStringMapping)[str.toLowerCase()]);
}
