import { capitalize, fromPairs, invert } from 'lodash';

/* Debug flags. */

export const ALWAYS_ENABLE_DEV_TOOLS = true;
export const LOG_SOCKET_IO = false;
export const KEEP_DECKS_UNSHUFFLED = false;
export const DISABLE_TURN_TIMER = false;
export const DISABLE_AI = false;
export const DISPLAY_HEX_IDS = false;
export const ENABLE_REDUX_TIME_TRAVEL = false;
const USE_LOCAL_PARSER = false;

/* Game rules. */

export const STARTING_PLAYER_HEALTH = 20;
export const MAX_HAND_SIZE = 7;

/* Animations. */

export const ANIMATION_TIME_MS = 400;
export const AI_RESPONSE_TIME_MS = 1250;
export const EVENT_ANIMATION_TIME_MS = 2000;
export const SHOW_TOOLTIP_TIMEOUT_MS = 500;

/* Board. */

export const GRID_CONFIG = {
  width: 600, height: 600,
  layout: { width: 6, height: 6, flat: false, spacing: 0 },
  origin: { x: 0, y: 0 },
  map: 'hexagon',
  mapProps: [ 3 ]
};

export const BLUE_CORE_HEX = '-3,0,3';
export const BLUE_PLACEMENT_HEXES = ['0,-3,3', '-1,-2,3', '-2,-1,3', '-3,1,2', '-3,2,1', '-3,3,0'];
export const ORANGE_CORE_HEX = '3,0,-3';
export const ORANGE_PLACEMENT_HEXES = ['3,-3,0', '3,-2,-1', '3,-1,-2', '2,1,-3', '1,2,-3', '0,3,-3'];

/* Cards. */

export const CARD_SCHEMA_VERSION = 1;
export const SPRITE_VERSION = 2;
// Sprite changes:
// * 1->2: trianglify instead of identicons for events

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

/* Parsing. */

export const PARSER_URL = USE_LOCAL_PARSER ? 'http://localhost:8080' : 'http://parser.wordbots.io';
export const PARSE_DEBOUNCE_MS = 500;

export const SYNONYMS = {
  ' 0 ': ' zero ',
  ' 1 ': ' one ',
  ' 2 ': ' two ',
  ' 3 ': ' three ',
  ' 4 ': ' four ',
  ' 5 ': ' five ',
  ' 6 ': ' six ',
  ' 7 ': ' seven ',
  ' 8 ': ' eight ',
  ' 9 ': ' nine ',
  ' 10 ': ' ten ',

  'can\'t': 'cannot',
  'it is': 'it\'s',

  'robot': ['creature', 'minion'],
  'startup': ['start up', 'start-up'],
  'shutdown': ['shut down', 'shut-down']
};

export const KEYWORDS = {
  'defender': 'This robot can\'t attack.',
  'haste': 'This robot can move and attack immediately after it is played.',
  'jump': 'This robot can move over other objects.',
  'taunt': 'Your opponent\'s adjacent robots can only attack this object.',
  'startup:': 'When this object is played,',
  'shutdown:': 'When this object is destroyed,'
};

export const HINTS = {
  'activate:': 'Objects can Activate once per turn. (Robots can\'t activate and attack in the same turn)'
};

function objToRegexes(obj) {
  return fromPairs(Object.keys(obj).map(k => [k, new RegExp(`(${k}|${capitalize(k)})`)]));
}

export const KEYWORD_REGEXES = objToRegexes(KEYWORDS);
export const HINT_REGEXES = objToRegexes(HINTS);
