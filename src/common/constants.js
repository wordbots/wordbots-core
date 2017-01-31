export const TYPE_ROBOT = 0;
export const TYPE_EVENT = 1;
export const TYPE_CORE = 2;

export function typeToString(type) {
  if (type == TYPE_ROBOT) {
    return 'Robot';
  } else if (type == TYPE_EVENT) {
    return 'Event';
  } else if (type == TYPE_CORE) {
    return 'Core';
  }
}
