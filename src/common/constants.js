export const STARTING_PLAYER_HEALTH = 20;

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
  mapProps: [ 4 ]
};

export function typeToString(type) {
  if (type == TYPE_ROBOT) {
    return 'Robot';
  } else if (type == TYPE_EVENT) {
    return 'Event';
  } else if (type == TYPE_CORE) {
    return 'Kernel';
  } else if (type == TYPE_STRUCTURE) {
    return 'Structure';
  }
}

export function stringToType(str) {
  if (str.toLowerCase() == 'robot') {
    return TYPE_ROBOT;
  } else if (str.toLowerCase() == 'event') {
    return TYPE_EVENT;
  } else if (str.toLowerCase() == 'kernel') {
    return TYPE_CORE;
  } else if (str.toLowerCase() == 'structure') {
    return TYPE_STRUCTURE;
  }
}
