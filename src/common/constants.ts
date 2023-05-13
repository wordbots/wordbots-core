import { capitalize, fromPairs, invert, isNil } from 'lodash';

import { GridConfig } from './components/hexgrid/types';
import { CardType, Format, HexId, PlayerColor } from './types';
import { inBrowser } from './util/browser';

// Debug flags.
// Note that you can use the env vars PARSER={local,staging,live} FIREBASE_DB={staging,production}
// to switch out the parser server and Firebase DB endpoints locally ('staging' is default for both).

export const ALWAYS_ENABLE_DEV_TOOLS = true;
export const LOG_SOCKET_IO = false;
export const KEEP_DECKS_UNSHUFFLED = false;
export const DISABLE_TURN_TIMER = false;
export const DISABLE_AI = false;
export const DISPLAY_HEX_IDS = false;
export const ENABLE_REDUX_TIME_TRAVEL = false;
export const ENABLE_ULTRA_VERBOSE_DEBUG_GAME_LOG = false;  // logs ALL debug messages in game log, even ones not corresponding to player actions (this can get VERY verbose)

// Server settings.

export const DISCONNECT_FORFEIT_TIME_SECS = 30; // How long the server will wait after a player disconnects before forfeiting that player's game
export const ENABLE_OBFUSCATION_ON_SERVER = false; // Don't set to true until all the bugs are worked out!

// Game rules.

export const DEFAULT_GAME_FORMAT: Format = 'normal';
export const STARTING_PLAYER_COLOR: PlayerColor = 'orange';
export const STARTING_PLAYER_HEALTH = 20;
export const DECK_SIZE = 30;
export const MAX_HAND_SIZE = 7;
export const MAX_EXECUTION_STACK_SIZE = 50; // in practice, stack overflow gets triggered around ~450 - we want to be well below that level

export const MIN_CARDS_IN_SET = 20;
export const MIN_CARDS_OF_EACH_RARITY_IN_SET = 4;

// Animations.

export const ANIMATION_TIME_MS = 400;
export const AI_RESPONSE_TIME_MS = 2200;
export const EVENT_ANIMATION_TIME_MS = 2000;
export const SHOW_TOOLTIP_TIMEOUT_MS = 500;

// Layout.

export const HEADER_HEIGHT = 64;
export const UNSUPPORTED_BROWSER_MESSAGE_HEIGHT = 50;
export const SIDEBAR_COLLAPSED_WIDTH = 58;
export const SIDEBAR_Y_OFFSET = 10;
export const CHAT_WIDTH = 256;
export const CHAT_NARROW_WIDTH = 200;
export const CHAT_COLLAPSED_WIDTH = 64;
export const MAX_BOARD_SIZE = 700;

// Z Indices

export const BACKGROUND_Z_INDEX = 900;
export const CHAT_Z_INDEX = 920;
export const DIALOG_Z_INDEX = 970;
export const LEFT_CONTROLS_Z_INDEX = 980;
export const BOARD_Z_INDEX = 1000;
export const SIDEBAR_Z_INDEX = 1600;
export const HAND_Z_INDEX = 50000;
export const STATUS_Z_INDEX = 60000;
export const MAX_Z_INDEX = 99910;
export const TUTORIAL_Z_INDEX = 99920;
export const EVENT_ANIMATION_Z_INDEX = 99930;
export const TUTORIAL_INTRO_Z_INDEX = 99940;

// Board.

export const GRID_CONFIG: GridConfig = {
  layout: { width: 6, height: 6, flat: false, spacing: 0 },
  origin: { x: 0, y: 0 },
  map: 'hexagon',
  mapProps: [3]
};

export const BOARD_SIZE_MULTIPLIER = 1.35;
export const BLUE_CORE_HEX: HexId = '-3,0,3';
export const BLUE_PLACEMENT_HEXES: HexId[] = ['0,-3,3', '-1,-2,3', '-2,-1,3', '-3,1,2', '-3,2,1', '-3,3,0'];
export const ORANGE_CORE_HEX: HexId = '3,0,-3';
export const ORANGE_PLACEMENT_HEXES: HexId[] = ['3,-3,0', '3,-2,-1', '3,-1,-2', '2,1,-3', '1,2,-3', '0,3,-3'];

// Cards.

export const CARD_SCHEMA_VERSION = 2;
// JSON schema changes:
// * 1->2: export creator's uid and username
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
  [TYPE_EVENT]: 'action',
  [TYPE_CORE]: 'kernel',
  [TYPE_STRUCTURE]: 'structure'
};

export function typeToString(type: CardType | undefined): string {
  return isNil(type) ? '' : capitalize(typeToStringMapping[type.toString()]);
}

export function stringToType(str: string): CardType {
  return parseInt(invert(typeToStringMapping)[str.toLowerCase()], 10) as CardType;
}

// DB.

const FIREBASE_PROD_CONFIG = {
  apiKey: 'AIzaSyD6XsL6ViMw8_vBy6aU7Dj9F7mZJ8sxcUA',  // Note that this is the client API key, with very limited permissions
  authDomain: 'wordbots.firebaseapp.com',
  databaseURL: 'https://wordbots.firebaseio.com',
  projectId: 'wordbots',
  storageBucket: 'wordbots.appspot.com',
  messagingSenderId: '913868073872'
};

const FIREBASE_STAGING_CONFIG = {
  apiKey: "AIzaSyCNa7SYKFX91T_UPSXK5SBHfLTL2QSAH5A",  // Note that this is the client API key, with very limited permissions
  authDomain: "wordbots-staging.firebaseapp.com",
  databaseURL: "https://wordbots-staging.firebaseio.com",
  projectId: "wordbots-staging",
  storageBucket: "wordbots-staging.appspot.com",
  messagingSenderId: "755003910639",
  appId: "1:755003910639:web:777afce7e570ea691c6e1a"
};

export const IS_PRODUCTION_ENV = (
  inBrowser()
    ? ['wordbots.io', 'app.wordbots.io', 'wordbots-game.herokuapp.com'].includes(window.location.hostname)  // eslint-disable-line compat/compat
    : process.env.HEROKU_APP_ID === 'a0939e51-43c3-473c-a948-deb50512cc66'
);

export const FIREBASE_CONFIG = (() => {
  if (inBrowser()) {
    if (IS_PRODUCTION_ENV) {
      // On a production host (wordbots.io, app.wordbots.io, wordbots-game.herokuapp.com are all equivalent), use production DB
      return FIREBASE_PROD_CONFIG;
    } else if (window.location.hostname === 'localhost') {
      // On localhost, default to staging DB unless otherwise specified
      return process.env.FIREBASE_DB === 'production' ? FIREBASE_PROD_CONFIG : FIREBASE_STAGING_CONFIG;
    } else {
      // Otherwise, default to staging DB
      return FIREBASE_STAGING_CONFIG;
    }
  } else {
    // If not in browser (i.e. wordbots server), check the HEROKU_APP_ID env var (provided by the runtime-dyno-metadata addon)
    // to see if we are in the production app, and if so, connect to the production DB
    if (process.env.HEROKU_APP_ID === 'a0939e51-43c3-473c-a948-deb50512cc66') {
      return FIREBASE_PROD_CONFIG;
    } else {
      // Otherwise, default to staging DB unless otherwise specified
      return process.env.FIREBASE_DB === 'production' ? FIREBASE_PROD_CONFIG : FIREBASE_STAGING_CONFIG;
    }
  }

})();

// Parsing.

const LIVE_PARSER_URL = 'https://parser.wordbots.io';
const STAGING_PARSER_URL = 'https://parser-staging.wordbots.io';
const LOCAL_PARSER_URL = 'http://localhost:8080';

export const PARSER_URL: string = (() => {
  if (inBrowser()) {
    if (IS_PRODUCTION_ENV) {
      // On a production host (wordbots.io, app.wordbots.io, wordbots-game.herokuapp.com are all equivalent), use production parser
      return LIVE_PARSER_URL;
    } else if (window.location.hostname === 'localhost') {
      // On localhost, default to staging parser unless otherwise specified
      if (process.env.PARSER === 'local') {
        return LOCAL_PARSER_URL;
      } else if (process.env.PARSER === 'live') {
        return LIVE_PARSER_URL;
      } else {
        return STAGING_PARSER_URL;
      }
    }
  }

  return STAGING_PARSER_URL;  // otherwise default to staging parser
})();

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

  'action': ['event'],
  'robot': ['creature', 'minion'],
  'startup': ['start up', 'start-up'],
  'shutdown': ['shut down', 'shut-down'],
  'tiles': ['spaces', 'hexes'],  // plural entry has to come before singular so "hexes" -> "tiles" instead of "[hex]es" -> "[tile]es"
  'tile': ['space', 'hex'],
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

// Other services.

export const DISCORD_PROD_LOG_WEBHOOK_URL = 'https://discord.com/api/webhooks/1106148299808964670/XM7pUFrliZEVTRR84l6Oouz8_Zo4F49Q0yxVkKoRUAeYGkgPmLwnVI5ht0kmtW3cUgBy';
export const DISCORD_PARSE_ISSUES_WEBHOOK_URL = 'https://discord.com/api/webhooks/1101686217772388392/bjgj-GHNUKxc697p7VngcH1c1I_KdxNcEd4yVq8E8D1obcPRgKTu6sx24nPNeyM7ybgE';

// Player colors.

export const ORANGE_PLAYER_COLOR = '#ffb85d';
export const ORANGE_PLAYER_COLOR_DARKENED = '#d99237';
export const BLUE_PLAYER_COLOR = '#badbff';
export const BLUE_PLAYER_COLOR_DARKENED = '#94b5d9';

// Effect icons.

export const EFFECT_ICONS: Record<string, { icon: string, description: string }> = {
  'canmoveoverobjects': {
    icon: '', // ra-feather-wing
    description: 'Jump (This robot can move over other objects.)'
  },
  'cannotactivate': {
    icon: '', // ra-hand-emblem
    description: 'This object can\t activate abilities.'
  },
  'cannotattack': {
    icon: '', // ra-shield
    description: 'Defender (This robot can\'t attack.)'
  },
  'cannotfightback': {
    icon: '', // ra-broken-shield
    description: 'This object can\'t fight back when attacked.'
  },
  'cannotmove': {
    icon: '', // ra-falling
    description: 'This robot can\'t move.'
  },
  'cannotmoveto': {
    icon: '', // ra-player-teleport
    description: 'This robot cannot move to certain hexes.'
  },
  'canonlyattack': {
    icon: '', // ra-aware
    description: 'This robot can only attack certain objects.'
  },
  'taunt': {
    icon: '', // ra-muscle-fat
    description: 'Taunt (Your opponent\'s adjacent robots can only attack this object.)'
  },
};
