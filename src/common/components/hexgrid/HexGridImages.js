import { inTest } from '../../util/browser.tsx';

export default function loadImages() {
  // (Don't try to load images while in test mode because it's too complicated.)
  if (inTest()) {
    return {};
  } else {
    return {
      'blue_tile': require('../img/blue_tile.png'),
      'bright_blue_tile': require('../img/bright_blue_tile.png'),
      'orange_tile': require('../img/orange_tile.png'),
      'bright_orange_tile': require('../img/bright_orange_tile.png'),

      'blue_grayish_tile': require('../img/blue_grayish_tile.png'),
      'bright_blue_grayish_tile': require('../img/bright_blue_grayish_tile.png'),
      'orange_grayish_tile': require('../img/orange_grayish_tile.png'),
      'bright_orange_grayish_tile': require('../img/bright_orange_grayish_tile.png'),

      'red_tile': require('../img/red_tile.png'),
      'green_tile': require('../img/green_tile.png'),

      'core_blue': require('../img/core_blue.png'),
      'core_orange': require('../img/core_orange.png'),

      'floor': require('../img/floor.png')
    };
  }
}
