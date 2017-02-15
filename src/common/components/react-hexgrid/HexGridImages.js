export default function loadImages() {
  return {
    'blue_tile': require('../img/blue_tile.png'),
    'bright_blue_tile': require('../img/bright_blue_tile.png'),
    'orange_tile': require('../img/orange_tile.png'),
    'bright_orange_tile': require('../img/bright_orange_tile.png'),
    'red_tile': require('../img/red_tile.png'),
    'green_tile': require('../img/green_tile.png'),

    // Spritesheet generated from:
    // http://img.uninhabitant.com/spritegen.html?controls=false&controls=true&autorandomize=false&pal=arne&colours=3&bg=2&size=16&spacing=10&tiles=32&zoom=1&scaler0=eagle2x&scaler1=none&advanced=false&advanced=true&seed=1487119194233&autoreseed=false&autoreseed=true&falloff=cosine&probmin=0&probmax=1&bias=0.5&gain=0.5&mirrorh=0.75&mirrorv=0.25&despeckle=0.9&despur=0.5
    'spritesheet': require('../img/sprites_padding.png'),

    'core_blue': require('../img/core_blue.png'),
    'core_orange': require('../img/core_orange.png')
  };
}
