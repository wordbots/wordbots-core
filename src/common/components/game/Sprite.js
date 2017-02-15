// Adapted from https://github.com/denilsonsa/spritegen .

//////////////////////////////////////////////////////////////////////
// Global constants.

const transcolor = 0x010101;

const A = 10;
//const B = 11;
//const C = 12;
const D = 13;
const E = 14;
//const F = 15;
//const G = 16;

const NONE = 0;
const BEVEL = 1;
const GOURAUD = 2;

//////////////////////////////////////////////////////////////////////
// Tables.

const coltables = [  // int[][]
  /*[
  transcolor,transcolor,transcolor, // trans
  0x000000, 0x000000, 0x000000,     // outline
  0xf02020, 0xff6060, 0xffa0a0,     // col2
  0x20f020, 0x60ff60, 0xa0ffa0,     // col1
  0xFFE020, 0xFFB000, 0xF0A000,     // col3
  0xFFFFFF, 0xB0B0B0, 0x808080,     // highlight
  ],*/
  [
  transcolor,transcolor,transcolor, // trans
  0x000000, 0x000000, 0x000000,     // outline
  0xC0A080, 0x806040, 0x503010,     // col2
  0xFF7070, 0xD04040, 0xB02020,     // col1
  0xFFE020, 0xFFB000, 0xF0A000,     // col3
  0xFFFFFF, 0xB0B0B0, 0x808080,     // highlight
  ],
  [
  transcolor,transcolor,transcolor, // trans
  0x000000, 0x000000, 0x000000,     // outline
  0x808080, 0x505050, 0x202020,     // col2
  0x9090FF, 0x6060F0, 0x4040E0,     // col1
  0x20E0FF, 0x00B0FF, 0x00A0F0,     // col3
  0xFFFFFF, 0xB0B0B0, 0x808080,     // highlight
  ],
  [
  transcolor,transcolor,transcolor, // trans
  0x000000, 0x000000, 0x000000,     // outline
  0xA0C080, 0x608040, 0x305010,     // col2
  0x70FF70, 0x40D040, 0x20B020,     // col1
  0xE0FF20, 0xB0FF00, 0xA0F000,     // col3
  0xFFFFFF, 0xB0B0B0, 0x808080,     // highlight
  ],
  [
  transcolor,transcolor,transcolor, // trans
  0x000000, 0x000000, 0x000000,     // outline
  0x907090, 0x604060, 0x301030,     // col2
  0xE020E0, 0xB000B0, 0xA000A0,     // col3
  0xFF9090, 0xF06060, 0xE04040,     // col1
  0xFFFFFF, 0xB0B0B0, 0x808080,     // highlight
  ],
  [
  transcolor,transcolor,transcolor, // trans
  0x000000, 0x000000, 0x000000,     // outline
  0xA080C0, 0x604080, 0x301050,     // col2
  0x7070FF, 0x4040D0, 0x2020B0,     // col1
  0xE020FF, 0xB000FF, 0xA000F0,     // col3
  0xFFFFFF, 0xB0B0B0, 0x808080,     // highlight
  ],
  [
  transcolor,transcolor,transcolor, // trans
  0x000000, 0x000000, 0x000000,     // outline
  0x80A0C0, 0x507090, 0x204060,     // col2
  0x20D0F0, 0x00B0D0, 0x0090B0,     // col3
  0x50FF50, 0x30F030, 0x10E010,     // col1
  0xFFFFFF, 0xB0B0B0, 0x808080,     // highlight
  ],
// ];
//
// let simplecoltables = [
  [ // red/yellow
  transcolor,transcolor,transcolor, // trans
  0x000000, 0x000000, 0x000000,     // outline
  0xFF0000, 0xD00000, 0xA00000,     // col
  0xFF0000, 0xD00000, 0xA00000,     // col
  0xFFD000, 0xD0B000, 0xA08000,     // col
  0xFFFFFF, 0xB0B0B0, 0x808080,     // highlight
  ],
  [ // blue
  transcolor,transcolor,transcolor, // trans
  0x000000, 0x000000, 0x000000,     // outline
  0x0000FF, 0x0000D0, 0x0000A0,     // col
  0x0000FF, 0x0000D0, 0x0000A0,     // col
  0x9090FF, 0x6868D0, 0x4040A0,     // col
  0xFFFFFF, 0xB0B0B0, 0x808080,     // highlight
  ],
];

// filltable values:
// bit 0-1:
// 00 = leave blank
// 01 = randomly fill or leave blank
// 10 = always fill
// 11 = outline (always black)
// bit 2:
// 0 = disable black
// 1 = enable black
// bit 3:
// 0 = disable extra highlights
// 1 = enable extra highlights
// So:
// 0 = transparent
// 1 = transparent or any colour except black
// 2 = any colour except black
// 3 = always black
// 4 = N/A (transparent)
// 5 = transparent or any colour + black
// 6 = any colour + black
// 7 = N/A (always black)
// 8 = N/A (transparent)
// 9 = transparent or colour with highlights, no black
// A = colour with highlights, no black 1010
// B = N/A (always black)
// C = N/A (transparent)
// D = transparent or colour with highlights + black
// E = colour with highlights + black
// F = N/A (always black)

const shipfilltable = [  // int[][]
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,2],
  [0,0,0,0,0,0,1,2],
  [0,0,0,0,0,0,1,2],
  [0,0,0,0,0,1,2,2],
  [0,0,0,0,0,1,2,A],
  [0,0,0,0,1,2,2,A],
  [0,0,0,0,2,2,A,A],
  [0,1,9,2,2,2,A,A],
  [0,9,A,2,2,2,A,A],
  [0,9,A,2,2,A,A,A],
  [0,9,A,2,2,A,A,A],
  [0,9,A,1,1,2,A,A],
  [0,9,A,1,2,2,9,9],
  [0,9,9,1,1,1,9,9],
  [0,0,0,0,0,0,0,0],
];

const fishfilltable = [  // int[][]
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,0],
  [0,0,1,1,2,2,2,2,2,2,2,1,0,0,1,1,1,2,9,0],
  [0,1,1,2,2,2,2,2,2,2,2,2,1,1,1,2,2,A,A,0],
  [0,1,2,2,A,A,A,A,A,2,2,2,2,2,2,2,2,9,A,0],
  [0,1,2,A,A,A,A,A,A,A,2,2,1,1,1,1,1,9,9,0],
//  [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,0],
//  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

const tilefilltable = [  // int[][]
  [2,2,2,2,2,2,2,2],
  [2,6,6,2,2,2,2,2],
  [2,6,6,6,2,2,2,2],
  [2,2,6,6,6,2,2,2],
  [2,2,2,6,E,A,A,A],
  [2,2,2,2,A,E,A,A],
  [2,2,2,2,A,A,E,A],
  [2,2,2,2,A,A,A,A],
];

const bubblefilltable = [  // int[][]
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,2,2,2,2],
  [0,0,0,A,A,1,1,1],
  [0,0,A,A,1,1,1,1],
  [0,2,A,1,1,1,1,1],
  [0,2,1,1,1,1,1,1],
  [0,2,1,1,1,1,1,1],
  [0,2,1,1,1,1,1,1],
];

const blob10filltable = [  // int[][]
  [0,0,0,0,0],
  [0,0,0,1,1],
  [0,0,1,9,A],
  [0,1,9,A,A],
  [0,1,2,2,2],
  [0,1,2,2,2],
  [0,1,9,A,A],
  [0,0,1,9,A],
  [0,0,0,1,1],
  [0,0,0,0,0],
];

const rand6filltable = [  // int[][]
  [D,D,D],
  [D,D,D],
  [D,D,D],
  [D,D,D],
  [D,D,D],
  [D,D,D],
];

const rand10filltable = [  // int[][]
  [0,0,0,0,0],
  [0,9,9,9,9],
  [0,9,9,9,9],
  [0,9,9,9,9],
  [0,9,9,9,9],
  [0,9,9,9,9],
  [0,9,9,9,9],
  [0,9,9,9,9],
  [0,9,9,9,9],
  [0,0,0,0,0],
];

const rand8afilltable = [  // int[][]
  [0,0,0,0,0,0,0,0],
  [0,9,9,9,9,9,9,0],
  [0,9,9,9,9,9,9,0],
  [0,9,9,9,9,9,9,0],
  [0,9,9,9,9,9,9,0],
  [0,9,9,9,9,9,9,0],
  [0,9,9,9,9,9,9,0],
  [0,0,0,0,0,0,0,0],
];

const rand16filltable = [  // int[][]
  [0,0,0,0,0,0,0,0],
  [0,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,1],
  [0,0,0,0,0,0,0,0],
];

const ufofilltable18 = [  // int[][]
  [0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,1,1,1,1],
  [0,0,0,1,1,1,1,1,1],
  [0,0,1,1,1,1,9,9,9],
  [0,1,1,1,9,9,9,9,9],
  [0,1,1,1,9,9,9,9,9],
  [0,1,1,9,9,9,9,9,9],
  [0,1,1,9,9,9,9,9,9],
  [0,1,1,9,9,9,9,9,9],
];

//////////////////////////////////////////////////////////////////////
// PixelArtGen class, the main portion of the code.

class PixelArtGen {
  constructor(
    xsize,  // int
    ysize,  // int
    filltable,  // int[][]
    animtable,  // int[][][]
    flipx,  // Boolean
    flipy,  // Boolean
    xshadingfac,  // int
    yshadingfac,  // int
    fill_prob,  // double
    fill_smoothing,  // double
    fill_smoothing_horiz_bias,  // double
    black_prob,  // double
    highlight_prob,  // double
    color_smoothing,  // double
    color_smoothing_horiz_bias  // double
  ) {
    // Render parameters (instance variables).

    this.xsize = xsize;  // int, 16
    this.ysize = ysize;  // int, 16

    this.filltable = filltable;  // int[][]
    this.animtable = animtable;  // int[][][]

    this.flipx = flipx;  // Boolean, true
    this.flipy = flipy;  // Boolean, false

    this.shading = NONE;  // int

    // Note: xshadingfac + yshadingfac must be <= 2
    // 0=no shading 1=darken 2=darken more
    this.xshadingfac = xshadingfac;  // int, 0
    // 0=no shading 1=darken 2=darken more
    this.yshadingfac = yshadingfac;  // int, 0

    // Probability of filling pixel.
    this.fill_prob = fill_prob;  // double, 0.6
    // Probability that a pixel is filled the same as its neighbours.
    this.fill_smoothing = fill_smoothing;  // double, 0.2
    // Balance between taking horizontal versus vertical neighbours.
    this.fill_smoothing_horiz_bias = fill_smoothing_horiz_bias;  // double, 0.8

    // Probability of black pixel if enabled.
    this.black_prob = black_prob;  // double, 0.2
    // Probability of highlight pixel if enabled.
    this.highlight_prob = highlight_prob;  // double, 0.4
    // Probability that a colour (non-black) pixel is taken from neighbour.
    this.color_smoothing = color_smoothing;  // double, 0.7
    // Balance between taking horizontal versus vertical neighbours.
    this.color_smoothing_horiz_bias = color_smoothing_horiz_bias;  // double, 0.5

    if (this.shading == BEVEL) {
      this.xshadingfac = 0;
      this.yshadingfac = 0;
      // this.highlight_prob = 0;
    }
    if (this.shading == GOURAUD) {
      this.highlight_prob = 0;
    }
  }

  // Params: int
  // Returns: int[][]
  static createTransparentBitmap(xsize, ysize) {
    let pixels = [];  // int[xsize][ysize]
    for (let i = 0; i < xsize; i++) {
      pixels[i] = [];
      for (let j = 0; j < ysize; j++) {
        pixels[i][j] = transcolor;
      }
    }
    return pixels;
  }

  // Param: int[][]
  // Returns: nothing
  static addOutline(hull) {
    for (let x = 0; x < hull.length; x++) {
      for (let y = 0; y < hull[x].length; y++) {
        let neigh = false;  // Boolean
        neigh = neigh || x > 0                  && (hull[x - 1][y] & 3) == 2;
        neigh = neigh || x < hull.length - 1    && (hull[x + 1][y] & 3) == 2;
        neigh = neigh || y > 0                  && (hull[x][y - 1] & 3) == 2;
        neigh = neigh || y < hull[x].length - 1 && (hull[x][y + 1] & 3) == 2;
        if (neigh && hull[x][y] == 0) {
          hull[x][y] = 3;
        }
      }
    }
  }

  // Param: int[][]
  // Returns: nothing
  static addOutlineRGB(pixels) {
    for (let x = 0; x < pixels.length; x++) {
      for (let y = 0; y < pixels[x].length; y++) {
        let neigh = false;  // Boolean
        neigh = neigh || x > 0                    && pixels[x - 1][y] != transcolor && pixels[x - 1][y] != 0;
        neigh = neigh || x < pixels.length - 1    && pixels[x + 1][y] != transcolor && pixels[x + 1][y] != 0;
        neigh = neigh || y > 0                    && pixels[x][y - 1] != transcolor && pixels[x][y - 1] != 0;
        neigh = neigh || y < pixels[x].length - 1 && pixels[x][y + 1] != transcolor && pixels[x][y + 1] != 0;
        if (neigh && pixels[x][y] == transcolor) {
          pixels[x][y] = 0;
        }
        if (!neigh && pixels[x][y] == 0) {
          pixels[x][y] = transcolor;
        }
      }
    }
  }

  // Weight is probability of using sprite 1.
  // Params: Sprite, Sprite, double (from 0.0 to 1.0)
  // Returns: Sprite
  mergeSprites(spr1, spr2, weight) {
    let spr = new Sprite(spr1.coltable, spr1.gen,
      this.xsize, spr1.pixels.length, this.ysize);
    let xmax = this.flipx ? Math.floor(this.xsize / 2) : this.xsize;  // int
    let ymax = this.flipy ? Math.floor(this.ysize / 2) : this.ysize;  // int
    for (let y = 0; y < ymax; y++) {
      for (let x = 0; x < xmax; x++) {
        if (Math.random() < weight) {
          spr.colidx[x][y] = spr1.colidx[x][y];
        } else {
          spr.colidx[x][y] = spr2.colidx[x][y];
        }
      }
    }
    this.flipAndShade(spr);
    this.indexToRGB(spr);
    this.animate(spr);
    PixelArtGen.addOutlineRGB(spr.pixels);
    return spr;
  }

  // Param: int[]
  // Returns: Sprite
  createSprite(coltable) {
    let xmax = this.flipx ? Math.floor(this.xsize / 2) : this.xsize;  // int
    let ymax = this.flipy ? Math.floor(this.ysize / 2) : this.ysize;  // int
    let totalxsize = (!this.animtable) ? this.xsize : this.xsize * (this.animtable.length + 1);  // int
    let spr = new Sprite(coltable, this, this.xsize, totalxsize, this.ysize);
    // Decide which parts of hull to fill:
    //   * main fill type 1 -> 2
    //   * add outline
    for (let y = 0; y < ymax; y++) {
      for (let x = 0; x < xmax; x++) {
        let filltype = this.filltable[y][x];  // int
        let filltype_main = (filltype & 3);  // int
        let filltype_fill = ((filltype & 12) | 2);  // int
        if (filltype_main == 1) {
          // smooth = get colour from neighbouring pixel
          if (Math.random() < this.fill_smoothing) {
            let above = false;  // Boolean
            let left = false;  // Boolean
            if (x > 0) {
              left = (spr.hull[x - 1][y] & 3) == 2;
            }
            if (y > 0) {
              above = (spr.hull[x][y - 1] & 3) == 2;
            }
            let chosen = above || left;  // Boolean
            if (chosen) {
              spr.hull[x][y] = filltype_fill;
            }
          } else {
            // XXX: Probably a bug! The ">" should have been "<".
            if (Math.random() > this.fill_prob) {
              spr.hull[x][y] = filltype_fill;
            }
          }
        } else if (filltype_main == 2) {
          spr.hull[x][y] = filltype_fill;
        } else if (filltype_main == 3) {
          spr.hull[x][y] = 3;
        }
      }
    }
    // this.addOutline(spr.hull);
    // Colour fill type is handled by colorize.
    this.colorize(spr);
    this.flipAndShade(spr);
    if (this.shading == BEVEL  ) this.bevelShadeNew(spr);
    if (this.shading == GOURAUD) this.gouraudShade(spr);
    this.indexToRGB(spr);
    this.animate(spr);
    PixelArtGen.addOutlineRGB(spr.pixels);
    return spr;
  }

  // Param: Sprite
  // Returns: nothing
  colorize(spr) {
    let xmax = this.flipx ? Math.floor(this.xsize / 2) : this.xsize;  // int
    let ymax = this.flipy ? Math.floor(this.ysize / 2) : this.ysize;  // int
    let white = Math.floor(spr.coltable.length / 3) - 1;  // int
    for (let y = 0; y < ymax; y++) {
      for (let x = 0; x < xmax; x++) {
        let colnr = 0;  // int
        let filltype = spr.hull[x][y];  // int
        if ((filltype & 3) == 3) {  // Outline.
          colnr = 1;
        } else if ((filltype & 3) == 2) {  // Normal fill.
          if ((filltype & 4) == 4) {  // Black enabled.
            if (Math.random() < this.black_prob) {
              colnr = 1;  // Black.
            } else {
              if ((filltype & 8) == 8) {  // Highlight enabled.
                if (Math.random() < this.highlight_prob) {
                  colnr = white;
                } else {
                  // Any colour except black and highlight.
                  colnr = Math.floor(2 + Math.random() * (Math.floor(spr.coltable.length / 3) - 3));
                }
              }
            }
          } else if ((filltype & 8) == 8) {  // Highlight enabled.
            if (Math.random() < this.highlight_prob) {
              colnr = white;
            } else {
              // Any colour except black and highlight.
              colnr = Math.floor(2 + Math.random() * (Math.floor(spr.coltable.length / 3) - 3));
            }
          } else { // Any colour except black and highlight.
            // NOTE: Previously highlight was also enabled but with normal probability.
            colnr = Math.floor(2 + Math.random() * (Math.floor(spr.coltable.length / 3) - 3));
          }
          // XXX: Both black and highlight not supported.
          // smooth = get colour from neighbouring pixel
          if (colnr > 1 && Math.random() < this.color_smoothing) {
            let above = 0;  // int
            let left = 0;  // int
            let chosen = 0;  // int
            if (x > 0) left  = Math.floor(spr.colidx[x - 1][y] / 3);
            if (y > 0) above = Math.floor(spr.colidx[x][y - 1] / 3);
            if (above == 0 && left == 0) {
              chosen = 0;
            } else if (above != 0 && left == 0) {
              chosen = above;
            } else if (above == 0 && left != 0) {
              chosen = left;
            } else if (above != 0 && left != 0) {
              if (Math.random() < this.color_smoothing_horiz_bias) {
                chosen = left;
              } else {
                chosen = above;
              }
            }
            if (chosen > 1) colnr = chosen;
          }
        }
        spr.colidx[x][y] = colnr * 3;
      }
    }
  }

  // flip according to symmetry axes and shade
  // Param: Sprite
  // Returns: nothing
  flipAndShade(spr) {
    for (let y = 0; y < this.ysize; y++) {
      for (let x = 0; x < this.xsize; x++) {
        let colnr = spr.colidx[x][y];  // int
        if (this.flipx && x < Math.floor(this.xsize / 2)) {
          spr.colidx[this.xsize - x - 1][y] = colnr + this.xshadingfac;
        }
        if (this.flipy && y < Math.floor(this.ysize / 2)) {
          spr.colidx[x][this.ysize - y - 1] = colnr + this.yshadingfac;
        }
        if (this.flipx && this.flipy && x < Math.floor(this.xsize / 2) && y < Math.floor(this.ysize / 2)) {
          spr.colidx[this.xsize - x - 1][this.ysize - y - 1] = colnr + this.xshadingfac + this.yshadingfac;
        }
      }
    }
    // if (this.shading == BEVEL) this.colorizeShadeAdd(spr);
  }

  // Param: Sprite
  // Returns: nothing
  indexToRGB(spr) {
    for (let x = 0; x < this.xsize; x++) {
      for (let y = 0; y < this.ysize; y++) {
        spr.pixels[x][y] = spr.coltable[spr.colidx[x][y]];
      }
    }
  }

  // Param: Sprite
  // Returns: nothing
  colorizeShadeAdd(spr) {
    // Shade given colours.
    for (let y = 0; y < this.ysize; y++) {
      for (let x = 0; x < this.xsize; x++) {
        let col = spr.colidx[x][y];  // int
        if (col != 0 && col != transcolor) {
          let tldist = this.findOutlineDist(spr, x, y, -1, -1, 5);  // int
          let brdist = this.findOutlineDist(spr, x, y, 1, 1, 5);  // int
          //console.log(tldist + ' ' + brdist);
          // 0=brightest .. 4=darkest
          // 0 / 2 / 4
          let bright = 4;  // int
          if (tldist < brdist * 2) bright = 3;
          if (tldist < brdist) bright = 2;
          if (tldist < Math.floor(brdist / 2)) bright = 1;
          if (tldist == 1 && brdist > 1) bright = 2;
          if (tldist == 2 && brdist > 2) bright = -1;
          if (tldist == 3 && brdist > 2) bright = 0;
          // Special cases: thin areas.
          if (tldist == 1 && brdist == 2) bright = 1;
          if (tldist == 2 && brdist == 1) bright = 3;
          // if (brdist == 1 && bright <= 2) bright += 2;
          // if (brdist == 2 && bright <= 3) bright += 1;
          // Any colour except black.
          // let colnr = Math.floor(2 + Math.random() * (Math.floor(spr.coltable.length / 3) - 2));
          if (bright >= 0) {
            let dither = ((bright & 1) == 1) && (((x + y) & 1) == 1);  // Boolean
            bright = Math.floor(bright / 2) + (dither ? 1 : 0);
            spr.colidx[x][y] += bright;
          } else {
            if (((x + y) & 1) == 1) spr.colidx[x][y] = 15;
          }
        }
      }
    }
  }

  // Params: spr is Sprite, all others are int
  // Returns: int
  findOutlineDist(spr, x, y, dx, dy, depth){
    /*
      let xx = x;  // int
    let xdist = 0;  // int
    let ydist = 0;  // int
    while (true) {
      if (xx < 0 || xx >= this.xsize) break;
      let yy = y;  // int
      ydist = 0;
      while (true) {
        if (yy < 0 || yy >= this.ysize) break;
        if (pixels[xx][yy] == 0) return xdist + ydist;
        yy += dy;
        ydist++;
      }
      xx += dx;
      xdist++;
    }
    return xdist + ydist;
    */
    if (x < 0 || x >= this.xsize
    ||  y < 0 || y >= this.ysize) return 0;
    if (spr.pixels[x][y] >= 0 && spr.pixels[x][y] <= 5) return 0;
    if (depth <= 0) return 7;
    // console.log(x + ' ' + y);
    let xdist = this.findOutlineDist(spr, x + dx, y, dx, dy, depth - 1);  // int
    let ydist = this.findOutlineDist(spr, x, y + dy, dx, dy, depth - 1);  // int
    // return xdist < ydist ? xdist + 1 : ydist + 1;
    return Math.min(xdist, ydist) + 1;
  }

  // Param: Sprite
  // Returns: nothing
  bevelShadeNew(spr) {
    // Shade given colours.
    for (let y = 0; y < this.ysize; y++) {
      for (let x = 0; x < this.xsize; x++) {
        let idx = spr.colidx[x][y];  // int
        // if (idx >= 15) idx -= 3; // Remove highlights.
        if (idx >= 6) {
          let tldist = this.findOutlineDistNew(spr, x, y, -1, -1, 2);  // int
          let brdist = this.findOutlineDistNew(spr, x, y, 1, 1, 2);  // int
          // console.log(tldist + ' ' + brdist);
          // 0=darkest ... 4=brightest. Odd numbers will dither.
          let bright = 2;  // int
          // if (tldist == 2) bright = 4;
          if (tldist == 1) bright = 4;
          // if (brdist == 2) bright = 1;
          if (brdist == 1) bright = 0;
          // Special cases: thin areas.
          if (tldist == 1 && brdist == 1) bright = 2;
          let dither = ((bright & 1) == 1) && (((x + y) & 1) == 1);  // Boolean
          // 0, 1, or 2
          bright = Math.floor(bright / 2) + (dither ? 1 : 0);
          if (bright == 2) {
            spr.colidx[x][y] = 15; // Highlight.
          } else {
            spr.colidx[x][y] = 3 * Math.floor(idx / 3) + 2 - 2 * bright;
          }
        }
      }
    }
  }

  // Params: spr is Sprite, all others are int
  // Returns: int
  findOutlineDistNew(spr, x, y, dx, dy, depth) {
    if (x < 0 || x >= this.xsize
    ||  y < 0 || y >= this.ysize) return 0;
    if (depth <= 0) return 0;
    if (spr.colidx[x][y] <= 5) return 0;
    let xdist = this.findOutlineDistNew(spr, x + dx, y, dx, dy, depth - 1);
    let ydist = this.findOutlineDistNew(spr, x, y + dy, dx, dy, depth - 1);
    // return (xdist < ydist) ? (xdist + 1) : (ydist + 1);
    return Math.min(xdist, ydist) + 1;
  }

  // Param: Sprite
  // Returns: nothing
  gouraudShade(spr) {
    let cenx = Math.floor(this.xsize / 4) + Math.floor(Math.random() * 2.999);  // int
    let ceny = Math.floor(this.ysize / 4) + Math.floor(Math.random() * 2.999);  // int
    let maxdist = this.xsize - cenx - 1;  // int
    let hlt_rx = Math.floor(Math.random() * 2.9999);  // int
    let hlt_ry = Math.floor(Math.random() * 2.9999);  // int
    let inner_r = 7 + Math.floor(Math.random() * 16);  // int
    let outer_r = 7 + Math.floor(Math.random() * 16);  // int
    for (let y = 0; y < this.ysize; y++) {
      let dy = Math.abs(y - ceny);  // int
      for (let x = 0; x < this.xsize; x++) {
        let dx = Math.abs(x - cenx);  // int
        let dd = dx * dx + dy * dy;  // int
        let idx = spr.colidx[x][y];  // int
        // if (idx == 15) idx -= 3;
        if (idx >= 6) {
          // 0=darkest .. 4=brightest. Odd numbers will dither.
          let bright = 2;  // int
          if (dx <= hlt_rx && dy <= hlt_ry) bright = 4;
          else if (dd <= inner_r) bright = 3;
          else if (dd >= maxdist * maxdist - outer_r) bright = 0;
          else if (dd >= maxdist * maxdist - outer_r - 13) bright = 1;
          let dither = ((bright & 1) == 1) && (((x + y) & 1) == 1);  // Boolean
          // 0, 1, or 2
          bright = Math.floor(bright / 2) + (dither ? 1 : 0);
          if (bright == 2) {
            spr.colidx[x][y] = 15; // highlight
          } else {
            spr.colidx[x][y] = 3 * Math.floor(idx / 3) + 2 - 2 * bright;
          }
          // spr.colidx[x][y] = 3 * Math.floor(idx / 3) + 2 - bright;
        }
      }
    }
  }

  // Param: Sprite
  // Returns: nothing
  animate(spr) {
    // Now, animate if applicable.
    if (!this.animtable) return;
    // d = distance travelled.
    // Pixels that travel the largest distance should overwrite other pixels.
    for (let d = 0; d <= 2; d++) {
      for (let y = 0; y < this.ysize; y++) {
        for (let x = 0; x < this.xsize; x++) {
          let col = spr.pixels[x][y];  // int
          if (col == transcolor) continue;
          for (let a = 0; a < this.animtable.length; a++) {
            let anim = this.animtable[a][y][x];  // int
            if (Math.floor((anim + 7) / 8) != d) continue;
            let dx = 0;  // int
            let dy = 0;  // int
            let mul = 1;  // int
            if (anim > 8) {
              mul = 2;
              anim -= 8;
            }
            if (anim == 8 || anim == 1 || anim == 2 ) dy = -1;
            if (anim == 2 || anim == 3 || anim == 4 ) dx = 1;
            if (anim == 4 || anim == 5 || anim == 6 ) dy = 1;
            if (anim == 6 || anim == 7 || anim == 8 ) dx = -1;
            dx *= mul;
            dy *= mul;
            // spr.pixels[(a + 1) * this.xsize + x][y] = transcolor;
            if (x + dx >= 0 && x + dx < this.xsize
            &&  y + dy >= 0 && y + dy < this.ysize) {
              spr.pixels[(a + 1) * this.xsize + x + dx][y + dy] = col;
            }
          }
        }
      }
    }
  }
}

//////////////////////////////////////////////////////////////////////
// Shapes.

const shapes = [  // PixelArtGen[]
  // shad -> xshadingfac, yshadingfac
  // fb   -> fill_prob
  // fs   -> fill_smoothing
  // fsh  -> fill_smoothing_horiz_bias
  // bp   -> black_prob
  // hp   -> highlight_prob
  // cs   -> color_smoothing
  // csh  -> color_smoothing_horiz_bias
  //               w   h  filltable             animtable               flipx  flipy  shad  fp   fs    fsh  bp   hp   cs   csh
  new PixelArtGen( 6,  6, rand6filltable      , null                  , true , false, 0, 0, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.3, 0.5),
  new PixelArtGen( 8,  8, rand8afilltable     , null                  , false, false, 0, 0, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.3, 0.5),
  new PixelArtGen(10, 10, blob10filltable     , null                  , true , false, 0, 0, 0.5, 0.2 , 0.5, 0.3, 0.4, 0.3, 0.5),
  new PixelArtGen(10, 10, rand10filltable     , null                  , true , false, 0, 0, 0.5, 0.2 , 0.5, 0.3, 0.4, 0.3, 0.5),
//  new PixelArtGen(10, 10, rand10filltable     , rand10walkanimtable   , true , false, 0, 0, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.3, 0.5),
//  new PixelArtGen(10, 10, rand10filltable     , rand10flyanimtable    , true , false, 0, 0, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.3, 0.5),
//  new PixelArtGen(12, 12, rand12filltable     , rand12walkanimtable   , true , false, 0, 0, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.3, 0.5),
//  new PixelArtGen(12, 12, rand12yfilltable    , rand12rwalkanimtable  , false, true , 0, 0, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.3, 0.5),
//  new PixelArtGen(12, 12, rand12filltable     , rand12flyanimtable    , true , false, 0, 0, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.3, 0.5),
//  new PixelArtGen(12, 12, rand12yfilltable    , rand12rflyanimtable   , false, true , 0, 0, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.3, 0.5),
//  new PixelArtGen(12, 12, rand12filltable     , rand12rcrawlanimtable , true , false, 0, 0, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.3, 0.5),
//  new PixelArtGen(12, 12, rand12filltable     , rand12crawlanimtable  , true , false, 0, 0, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.3, 0.5),
//  new PixelArtGen(12, 12, rand12yfilltable    , rand12crawlanimtable  , false, true , 0, 0, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.3, 0.5),
//  new PixelArtGen(12, 12, rand12dfilltable    , rand12crawlanimtable  , true , true , 0, 0, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.3, 0.5),
//  new PixelArtGen(12, 12, rand12filltable     , rand12bendanimtable   , true , false, 0, 0, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.3, 0.5),
//  new PixelArtGen(12, 12, rand12yfilltable    , rand12bendanimtable   , false, true , 0, 0, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.3, 0.5),
//  new PixelArtGen(12, 12, rand12dfilltable    , rand12bendanimtable   , true , true , 0, 0, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.3, 0.5),
//  new PixelArtGen(12, 12, rand12filltable     , rand12bubbleanimtable , true , false, 0, 0, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.3, 0.5),
//  new PixelArtGen(12, 12, rand12yfilltable    , rand12bubbleanimtable , false, true , 0, 0, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.3, 0.5),
//  new PixelArtGen(12, 12, rand12dfilltable    , rand12bubbleanimtable , true , true , 0, 0, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.3, 0.5),
//  new PixelArtGen(12, 12, rand12filltable     , rand12pokeanimtable   , true , false, 0, 0, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.3, 0.5),
//  new PixelArtGen(12, 12, rand12yfilltable    , rand12pokeanimtable   , false, true , 0, 0, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.3, 0.5),
//  new PixelArtGen(12, 12, rand12dfilltable    , rand12pokeanimtable   , true , true , 0, 0, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.3, 0.5),
//  new PixelArtGen(12, 12, rand12dfilltable    , rand12turnanimtable   , true , true , 0, 0, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.3, 0.5),
//  new PixelArtGen(12, 12, rand12filltable     , rand12wiggleanimtable , true , false, 0, 0, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.3, 0.5),
//  new PixelArtGen(12, 12, rand12yfilltable    , rand12rwiggleanimtable, false, true , 0, 0, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.3, 0.5),
//  new PixelArtGen(12, 12, rand12filltable     , rand12bounceanimtable , true , false, 0, 0, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.3, 0.5),
//  new PixelArtGen(12, 12, rand12dfilltable    , rand12bounceanimtable , true , true , 0, 0, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.3, 0.5),
//  new PixelArtGen(12, 12, rand12filltable     , rand12nullanimtable   , true , false, 0, 0, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.3, 0.5),
//  new PixelArtGen(12, 12, rand12dfilltable    , rand12nullanimtable   , true , true , 0, 0, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.3, 0.5),
  new PixelArtGen(16, 16, rand16filltable     , null                  , true , false, 0, 0, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.3, 0.5),
  new PixelArtGen(16, 16, shipfilltable       , null                  , true , false, 1, 1, 0.5, 0.6 , 0.5, 0.3, 0.4, 0.6, 0.5),
//  new PixelArtGen(16, 16, ship2filltable      , birdanimtable         , true , false, 1, 1, 0.6, 0.5 , 0.5, 0.3, 0.4, 0.5, 0.5),
  new PixelArtGen(16, 16, bubblefilltable     , null                  , true , true , 1, 1, 0.5, 0.6 , 0.5, 0.3, 0.4, 0.6, 0.5),
  new PixelArtGen(18, 18, ufofilltable18      , null                  , true , true , 1, 1, 0.5, 0.75, 0.5, 0.3, 0.4, 0.8, 0.5),
//  new PixelArtGen(18, 18, butterflyfilltable18, birdanimtable18       , true , false, 1, 1, 0.5, 0.7 , 0.5, 0.3, 0.4, 0.6, 0.5),
//  new PixelArtGen(18, 18, manfilltable18      , mananimtable18        , true , false, 1, 1, 0.5, 0.6 , 0.5, 0.3, 0.4, 0.6, 0.5),
  new PixelArtGen(20, 12, fishfilltable       , null                  , false, true , 1, 1, 0.5, 0.2 , 0.8, 0.3, 0.4, 0.6, 0.8),
  // Tiles:
//  new PixelArtGen(12, 12, tile12filltable     , rand12nullanimtable   , true , true , 0, 0, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.2, 0.5),
//  new PixelArtGen(12, 12, tile12filltable     , rand12nullanimtable   , true , true , 0, 0, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.7, 0.5),
//  new PixelArtGen(12, 12, tile12filltable     , rand12nullanimtable   , true , true , 1, 1, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.2, 0.5),
//  new PixelArtGen(12, 12, tile12filltable     , rand12nullanimtable   , true , true , 1, 1, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.7, 0.5),
//  new PixelArtGen(12, 12, tile12filltable     , rand12nullanimtable   , true , true , 0, 2, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.2, 0.5),
//  new PixelArtGen(12, 12, tile12filltable     , rand12nullanimtable   , true , true , 0, 2, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.7, 0.5),
//  new PixelArtGen(12, 12, tileplat12filltable , rand12nullanimtable   , true , true , 0, 0, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.2, 0.5),
//  new PixelArtGen(12, 12, tileplat12filltable , rand12nullanimtable   , true , true , 0, 0, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.7, 0.5),
//  new PixelArtGen(12, 12, tileplat12filltable , rand12nullanimtable   , true , true , 1, 1, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.2, 0.5),
//  new PixelArtGen(12, 12, tileplat12filltable , rand12nullanimtable   , true , true , 1, 1, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.7, 0.5),
//  new PixelArtGen(12, 12, tileplat12filltable , rand12nullanimtable   , true , true , 0, 2, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.2, 0.5),
//  new PixelArtGen(12, 12, tileplat12filltable , rand12nullanimtable   , true , true , 0, 2, 0.6, 0.2 , 0.5, 0.3, 0.4, 0.7, 0.5),
  new PixelArtGen(16, 16, tilefilltable       , null                  , true , true , 1, 1, 0.5, 0.4 , 0.5, 0.3, 0.4, 0.8, 0.5),
];

//////////////////////////////////////////////////////////////////////
// Sprite class.

class Sprite {
  constructor(
    coltable,  // int[]
    gen,  // PixelArtGen
    xsize,  // int
    totalxsize,  // int
    ysize  // int
  ) {
    // Render parameters as part of instance.
    this.coltable = coltable;
    this.gen = gen;

    // Output
    // xsize *ysize fill types
    this.hull = [];  // int[xsize][ysize]
    // xsize*ysize color indexes
    this.colidx = [];  // int[xsize][ysize]
    // xsize*ysize shade levels (0..2)
    // let shades;  // int[][]
    // xsize*animsize*ysize colours
    this.pixels = PixelArtGen.createTransparentBitmap(totalxsize, ysize);  // int[][]

    // Initializing 2D array size.
    for (let i = 0; i < xsize; i++) {
      this.hull[i] = [];
      this.hull[i][ysize - 1] = 0;
      this.colidx[i] = [];
      this.colidx[i][ysize - 1] = 0;
    }
  }

  get width() {
    return this.pixels.length;
  }

  get height() {
    if (this.pixels.length == 0) return 0;
    return this.pixels[0].length;
  }

  getNrFrames() {
    if (!this.gen.animtable) return 1;
    return this.gen.animtable.length + 1;
  }

  // Resets the pixel data to transparent.
  // Retuns: nothing
  clear() {
    for (let i = 0; i < this.pixels.length; i++) {
      for (let j = 0; j < this.pixels[i].length; j++) {
        this.pixels[i][j] = transcolor;
      }
    }
  }
}

//////////////////////////////////////////////////////////////////////
// Exporting to JavaScript canvas/ImageData.

// Params: Sprite, CanvasRenderingContext2D
// Returns: ImageData
function createImageDataFromSprite(spr, ctx) {
  let width = spr.width;
  let height = spr.height;
  let img = ctx.createImageData(width, height);
  drawSpriteIntoImageData(spr, img);
  return img;
}

// Params: Sprite, ImageData
// Returns: nothing
function drawSpriteIntoImageData(spr, img) {
  let width = spr.width;
  let height = spr.height;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let pixel = spr.pixels[x][y];
      let r = (pixel >> 16) & 255;
      let g = (pixel >> 8) & 255;
      let b = pixel & 255;
      let a = pixel == transcolor ? 0 : 255;
      img.data[(y * width + x) * 4 + 0] = r;
      img.data[(y * width + x) * 4 + 1] = g;
      img.data[(y * width + x) * 4 + 2] = b;
      img.data[(y * width + x) * 4 + 3] = a;
    }
  }
}


////////////////////////////////////////////////////////////
// Misc. useful functions.

// Same behavior as Python's randrange().
function randrange(begin, end) {
  if (end === undefined) {
    end = begin;
    begin = 0;
  }
  return Math.floor(Math.random() * (end - begin) + begin);
}

function reset_context(ctx, width, height) {
  if (width && height) {
    ctx.canvas.width = width;
    ctx.canvas.height = height;
  }
  ctx.webkitImageSmoothingEnabled = false;
  ctx.mozImageSmoothingEnabled = false;
  ctx.msImageSmoothingEnabled = false;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // clear context.
}

////////////////////////////////////////////////////////////
// UI interaction.

function redraw_canvases() {
  let w = g_sprite.width;
  let h = g_sprite.height;

  let rawcanvas = document.getElementById('raw');
  let ctx = rawcanvas.getContext('2d');
  reset_context(ctx, w, h);
  g_imagedata = createImageDataFromSprite(g_sprite, ctx);
  ctx.putImageData(g_imagedata, 0, 0);
}

function regenerate(ev) {
  let shapenum = randrange(10);
  let colornum = randrange(8);

  g_pixelartgen = shapes[shapenum];
  g_colortable = coltables[colornum];
  g_sprite = g_pixelartgen.createSprite(g_colortable);

  redraw_canvases();
}

////////////////////////////////////////////////////////////
// Global vars.

let g_pixelartgen = null;
let g_colortable = null;
let g_sprite = null;
let g_imagedata = null;

regenerate();
