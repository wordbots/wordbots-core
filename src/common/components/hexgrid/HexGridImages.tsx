import { inTest } from '../../util/browser';

import { PreLoadedImageName } from './types';

export default function loadImages(): Record<PreLoadedImageName, any> {
  // (Don't try to load images while in test mode because it's too complicated.)
  if (inTest()) {
    return {};
  } else {
    return {
      'blue_tile': require('../img/blue_tile.png'),
      'bright_blue_tile': require('../img/bright_blue_tile.png'),
      'orange_tile': require('../img/orange_tile.png'),
      'bright_orange_tile': require('../img/bright_orange_tile.png'),

      'red_tile': require('../img/red_tile.png'),
      'green_tile': require('../img/green_tile.png'),

      'core_blue': require('../img/core_blue_new.png'),
      'core_orange': require('../img/core_orange_new.png'),

      'floor': require('../img/floor.png')
    };
  }
}
