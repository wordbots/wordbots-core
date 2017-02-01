export const TYPE_ROBOT = 0;
export const TYPE_EVENT = 1;
export const TYPE_CORE = 2;

export function typeToString(type) {
  if (type == TYPE_ROBOT) {
    return 'Robot';
  } else if (type == TYPE_EVENT) {
    return 'Event';
  } else if (type == TYPE_CORE) {
    return 'Kernel';
  }
}

export function stringToType(str) {
  if (str.toLowerCase() == 'robot') {
    return TYPE_ROBOT;
  } else if (str.toLowerCase() == 'event') {
    return TYPE_EVENT;
  } else if (str.toLowerCase() == 'kernel') {
    return TYPE_CORE;
  }
}
