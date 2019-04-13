import { capitalize, fromPairs, invert, isNil } from 'lodash';

import { CardType, Format, HexId } from './types';

// Debug flags.

export const ALWAYS_ENABLE_DEV_TOOLS = true;
export const LOG_SOCKET_IO = false;
export const KEEP_DECKS_UNSHUFFLED = false;
export const DISABLE_TURN_TIMER = false;
export const DISABLE_AI = false;
export const DISPLAY_HEX_IDS = false;
export const ENABLE_REDUX_TIME_TRAVEL = false;
const USE_LOCAL_PARSER = false;
const LOCAL_PARSER_PORT = 8080;

// Server settings.

export const ENABLE_OBFUSCATION_ON_SERVER = false; // Don't set to try until all the bugs are worked out!

// Game rules.

export const DEFAULT_GAME_FORMAT: Format = 'normal';
export const STARTING_PLAYER_HEALTH = 20;
export const DECK_SIZE = 30;
export const MAX_HAND_SIZE = 7;

// Animations.

export const ANIMATION_TIME_MS = 400;
export const AI_RESPONSE_TIME_MS = 2200;
export const EVENT_ANIMATION_TIME_MS = 2000;
export const SHOW_TOOLTIP_TIMEOUT_MS = 500;

// Layout.

export const HEADER_HEIGHT = 64;
export const SIDEBAR_WIDTH = 225;
export const SIDEBAR_COLLAPSED_WIDTH = 64;
export const CHAT_WIDTH = 256;
export const CHAT_COLLAPSED_WIDTH = 64;
export const MAX_BOARD_SIZE = 700;

// Z Indices

export const DICTIONARY_TAB_Z_INDEX = 10;
export const BACKGROUND_Z_INDEX = 900;
export const SIDEBAR_Z_INDEX = 920;
export const CHAT_Z_INDEX = 920;
export const DIALOG_OVERLAY_Z_INDEX = 950;
export const DIALOG_MAIN_Z_INDEX = 960;
export const DIALOG_BODY_Z_INDEX = 970;
export const BOARD_Z_INDEX = 1000;
export const HAND_Z_INDEX = 1100;
export const STATUS_Z_INDEX = 2000;
export const MAX_Z_INDEX = 99999;
export const TUTORIAL_Z_INDEX = 999999;

// Board.

export const GRID_CONFIG = {
  width: 600, height: 600,
  layout: { width: 6, height: 6, flat: false, spacing: 0 },
  origin: { x: 0, y: 0 },
  map: 'hexagon',
  mapProps: [ 3 ]
};

export const BOARD_SIZE_MULTIPLIER = 1.35;
export const BLUE_CORE_HEX: HexId = '-3,0,3';
export const BLUE_PLACEMENT_HEXES: HexId[] = ['0,-3,3', '-1,-2,3', '-2,-1,3', '-3,1,2', '-3,2,1', '-3,3,0'];
export const ORANGE_CORE_HEX: HexId = '3,0,-3';
export const ORANGE_PLACEMENT_HEXES: HexId[] = ['3,-3,0', '3,-2,-1', '3,-1,-2', '2,1,-3', '1,2,-3', '0,3,-3'];

// Cards.

export const CARD_SCHEMA_VERSION = 1;
export const SPRITE_VERSION = 2;
// Sprite changes:
// * 1->2: trianglify instead of identicons for events

export const TYPE_ROBOT: CardType = 0;
export const TYPE_EVENT: CardType = 1;
export const TYPE_CORE: CardType = 2;
export const TYPE_STRUCTURE: CardType = 3;

export const CREATABLE_TYPES: CardType[] = [TYPE_ROBOT, TYPE_EVENT, TYPE_STRUCTURE];

const typeToStringMapping: Record<string, string> = {
  [TYPE_ROBOT]: 'robot',
  [TYPE_EVENT]: 'event',
  [TYPE_CORE]: 'kernel',
  [TYPE_STRUCTURE]: 'structure'
};

export function typeToString(type: CardType | undefined): string {
  return isNil(type) ? '' : capitalize(typeToStringMapping[type.toString()]);
}

export function stringToType(str: string): CardType {
  return parseInt(invert(typeToStringMapping)[str.toLowerCase()], 10) as CardType;
}

// Parsing.

export const PARSER_URL = USE_LOCAL_PARSER ? `http://localhost:${LOCAL_PARSER_PORT}` : 'http://parser.wordbots.io';
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

export const KEYWORDS: Record<string, string> = {
  'defender': 'This robot can\'t attack.',
  'haste': 'This robot can move and attack immediately after it is played.',
  'jump': 'This robot can move over other objects.',
  'taunt': 'Your opponent\'s adjacent robots can only attack this object.',
  'startup:': 'When this object is played,',
  'shutdown:': 'When this object is destroyed,'
};

export const HINTS: Record<string, string> = {
  'activate:': 'Objects can Activate once per turn. (Robots can\'t activate and attack in the same turn)'
};

function objToRegexes(obj: Record<string, string>): Record<string, RegExp> {
  return fromPairs(Object.keys(obj).map((k) => [k, new RegExp(`(${k}|${capitalize(k)})`)]));
}

export const KEYWORD_REGEXES = objToRegexes(KEYWORDS);
export const HINT_REGEXES = objToRegexes(HINTS);

// Player colors.

export const ORANGE_PLAYER_COLOR = '#ffb85d';
export const ORANGE_PLAYER_COLOR_DARKENED = '#d99237';
export const BLUE_PLAYER_COLOR = '#badbff';
export const BLUE_PLAYER_COLOR_DARKENED = '#94b5d9';
