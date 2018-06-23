// Adapted from https://github.com/not-surt/spritegen .

/* eslint-disable no-loops/no-loops */

import * as React from 'react';
import { number, string } from 'prop-types';
import { isUndefined } from 'lodash';

import { hashCode } from '../util/common';
import { inBrowser } from '../util/browser';

export default class Sprite extends React.PureComponent {
  static propTypes = {
    id: string,
    size: number,
    scale: number,
    spacing: number,
    palette: string,
    output: string
  };

  render() {
    const size = (this.props.size + (this.props.spacing || 0)) * 2;

    // Draw to a mock canvas, then create an image using the dataURL.
    const mockCanvasElt = this.createMockCanvas();
    if (mockCanvasElt) {
      mockCanvasElt.width = size;
      mockCanvasElt.height = size;
      const dataURL = this.drawSprite(mockCanvasElt, {
        seed: hashCode(this.props.id),

        // Available properties: seed, pal, colours, size, spacing, zoom,
        // scaler0, scaler1, falloff, probmin, probmax, bias, gain, mirrorh, mirrorv, despeckle, despur
        pal: this.props.palette,
        colours: 5,
        falloff: 'cosine',
        mirrorh: 1,
        mirrorv: 0,
        size: this.props.size,
        spacing: this.props.spacing || 0
      });

      if (this.props.output === 'html') {
        return (
          <img className="wb-sprite" src={dataURL} width={size * (this.props.scale || 1)} height={size * (this.props.scale || 1)} style={{imageRendering: 'pixelated'}} />
        );
      } else if (this.props.output === 'svg') {
        return (
          <image className="wb-sprite" xlinkHref={dataURL} width={1} height={1} style={{imageRendering: 'pixelated'}} />
        );
      }
    } else {
      return null;
    }
  }

  createMockCanvas() {
    if (inBrowser()) {
      return document.createElement('canvas');
    } else {
      try {
        const Canvas = require('canvas');
        return new Canvas();
      } catch (err) {
        return null;
      }
    }
  }

  // The code in drawSprite() is largely taken from
  // https://github.com/not-surt/spritegen
  drawSprite(elt, props) {
    const PIXEL_SIZE = 4;

    function indexFromCoord(width, x, y) {
      return y * width + x;
    }

    function ByteMap(width, height) {
      Uint8Array.call(this, width * height);
      this.width = width;
      this.height = height;
    }

    ByteMap.prototype = Object.create(Uint8Array.prototype, {
      set: function (x, y, value) { this[indexFromCoord(this.width, x, y)] = value; },
      get: function (x, y) { return this[indexFromCoord(this.width, x, y)]; }
    });

    function LinearCongruentialGenerator(a, c, m) {
      this.a = a;
      this.c = c;
      this.m = m;
      this.seed = 0;
    }

    LinearCongruentialGenerator.prototype = {
      _random: function () { return this.seed = (this.a * this.seed + this.c) % this.m; },
      random: function () { return this._random() / (this.m - 1); },
      reseed: function (seed) { this.seed = (seed ? seed : Date.now()) % this.m; }
    };

    const lcg0 = new LinearCongruentialGenerator(2147483629, 2147483587, Math.pow(2, 31) - 1);
    const lcg1 = new LinearCongruentialGenerator(25214903917, 11, Math.pow(2, 48));

    function random() { return (lcg0.random() + lcg1.random()) % 1; }
    function randomReseed(seed) { lcg0.reseed(seed); lcg1.reseed(lcg0.random()); }

    function arraycopy(dest, destStart, src, srcStart, len) {
      for (let i = 0; i < len; ++i) {
        dest[destStart + i] = src[srcStart + i];
      }
    }

    function getPixel(data, x, y) {
      if (x >= 0 && x < data.width && y >= 0 && y < data.height) {
        const colour = new Array();
        arraycopy(colour, 0, data.data, indexFromCoord(data.width * PIXEL_SIZE, x * PIXEL_SIZE, y), PIXEL_SIZE);
        return colour;
      }
    }

    function putPixel(data, x, y, colour) {
      if (x >= 0 && x < data.width && y >= 0 && y < data.height) {
        arraycopy(data.data, indexFromCoord(data.width * PIXEL_SIZE, x * PIXEL_SIZE, y), colour, 0, PIXEL_SIZE);
      }
    }

    function coloursEqual(colour0, colour1) {
      for (let i = 0; i < PIXEL_SIZE; ++i) {
        if (colour0[i] !== colour1[i])
          return false;
      }
      return true;
    }

    function rgbToRgba(colour) {
      return [colour[0], colour[1], colour[2], 255];
    }

    function scale2x(data, x, y)
    {
      const out = getPixel(data, x, y);
      return [out, out, out, out];
    }

    function scale3x(data, x, y)
    {
      const out = getPixel(data, x, y);
      return [out, out, out, out, out, out, out, out, out];
    }

    // A B C
    // D E F  --> E0 E1
    // G H I      E2 E3
    function scaleEagle2x(data, x, y)
    {
      const A = getPixel(data, x > 0 ? x - 1 : 0, y > 0 ? y - 1 : 0);
      const B = getPixel(data, x, y > 0 ? y - 1 : 0);
      const C = getPixel(data, x < data.width - 1 ? x + 1 : data.width - 1, y > 0 ? y - 1 : 0);
      const D = getPixel(data, x > 0 ? x - 1 : 0, y);
      const E = getPixel(data, x, y);
      const F = getPixel(data, x < data.width - 1 ? x + 1 : data.width - 1, y);
      const G = getPixel(data, x > 0 ? x - 1 : 0, y < data.height - 1 ? y + 1 : data.height - 1);
      const H = getPixel(data, x, y < data.height - 1 ? y + 1 : data.height - 1);
      const I = getPixel(data, x < data.width - 1 ? x + 1 : data.width - 1, y < data.height - 1 ? y + 1 : data.height - 1);
      return [
        coloursEqual(A, B) && coloursEqual(A, D) ? A : E,
        coloursEqual(C, B) && coloursEqual(C, F) ? C : E,
        coloursEqual(G, H) && coloursEqual(G, D) ? G : E,
        coloursEqual(I, F) && coloursEqual(I, H) ? I : E
      ];
    }

    // A B C      E0 E1 E2
    // D E F  --> E3 E4 E5
    // G H I      E6 E7 E8
    function scaleEagle3x(data, x, y)
    {
      const A = getPixel(data, x > 0 ? x - 1 : 0, y > 0 ? y - 1 : 0);
      const B = getPixel(data, x, y > 0 ? y - 1 : 0);
      const C = getPixel(data, x < data.width - 1 ? x + 1 : data.width - 1, y > 0 ? y - 1 : 0);
      const D = getPixel(data, x > 0 ? x - 1 : 0, y);
      const E = getPixel(data, x, y);
      const F = getPixel(data, x < data.width - 1 ? x + 1 : data.width - 1, y);
      const G = getPixel(data, x > 0 ? x - 1 : 0, y < data.height - 1 ? y + 1 : data.height - 1);
      const H = getPixel(data, x, y < data.height - 1 ? y + 1 : data.height - 1);
      const I = getPixel(data, x < data.width - 1 ? x + 1 : data.width - 1, y < data.height - 1 ? y + 1 : data.height - 1);
      return [
        coloursEqual(A, D) && coloursEqual(A, B) ? A : E,
        /*coloursEqual(B, A) && coloursEqual(B, C) ? B :*/ E,
        coloursEqual(C, B) && coloursEqual(C, F) ? C : E,
        /*coloursEqual(D, G) && coloursEqual(D, A) ? D :*/ E,
        E,
        /*coloursEqual(F, C) && coloursEqual(F, I) ? F :*/ E,
        coloursEqual(G, H) && coloursEqual(G, D) ? G : E,
        /*coloursEqual(H, I) && coloursEqual(H, G) ? H :*/ E,
        coloursEqual(I, F) && coloursEqual(I, H) ? I : E
      ];
    }

    // A B C
    // D E F  --> E0 E1
    // G H I      E2 E3
    function scaleScale2x(data, x, y)
    {
      const B = getPixel(data, x, y > 0 ? y - 1 : 0);
      const D = getPixel(data, x > 0 ? x - 1 : 0, y);
      const E = getPixel(data, x, y);
      const F = getPixel(data, x < data.width - 1 ? x + 1 : data.width - 1, y);
      const H = getPixel(data, x, y < data.height - 1 ? y + 1 : data.height - 1);
      const out = [];
      if (!coloursEqual(B, H) && !coloursEqual(D, F)) {
        out[0] = coloursEqual(B, D) ? D : E;
        out[1] = coloursEqual(B, F) ? F : E;
        out[2] = coloursEqual(D, H) ? D : E;
        out[3] = coloursEqual(H, F) ? F : E;
      } else {
        out[0] = E;
        out[1] = E;
        out[2] = E;
        out[3] = E;
      }
      return out;
    }

    // A B C      E0 E1 E2
    // D E F  --> E3 E4 E5
    // G H I      E6 E7 E8
    function scaleScale3x(data, x, y)
    {
      const A = getPixel(data, x > 0 ? x - 1 : 0, y > 0 ? y - 1 : 0);
      const B = getPixel(data, x, y > 0 ? y - 1 : 0);
      const C = getPixel(data, x < data.width - 1 ? x + 1 : data.width - 1, y > 0 ? y - 1 : 0);
      const D = getPixel(data, x > 0 ? x - 1 : 0, y);
      const E = getPixel(data, x, y);
      const F = getPixel(data, x < data.width - 1 ? x + 1 : data.width - 1, y);
      const G = getPixel(data, x > 0 ? x - 1 : 0, y < data.height - 1 ? y + 1 : data.height - 1);
      const H = getPixel(data, x, y < data.height - 1 ? y + 1 : data.height - 1);
      const I = getPixel(data, x < data.width - 1 ? x + 1 : data.width - 1, y < data.height - 1 ? y + 1 : data.height - 1);
      const out = [];
      if (!coloursEqual(B, H) && !coloursEqual(D, F)) {
        out[0] = coloursEqual(D, B) ? D : E;
        out[1] = (coloursEqual(D, B) && !coloursEqual(E, C)) || (coloursEqual(B, F) && !coloursEqual(E, A)) ? B : E;
        out[2] = coloursEqual(B, F) ? F : E;
        out[3] = (coloursEqual(D, B) && !coloursEqual(E, G)) || (coloursEqual(D, H) && !coloursEqual(E, A)) ? D : E;
        out[4] = E;
        out[5] = (coloursEqual(B, F) && !coloursEqual(E, I)) || (coloursEqual(H, F) && !coloursEqual(E, C)) ? F : E;
        out[6] = coloursEqual(D, H) ? D : E;
        out[7] = (coloursEqual(D, H) && !coloursEqual(E, I)) || (coloursEqual(H, F) && !coloursEqual(E, G)) ? H : E;
        out[8] = coloursEqual(H, F) ? F : E;
      } else {
        out[0] = E;
        out[1] = E;
        out[2] = E;
        out[3] = E;
        out[4] = E;
        out[5] = E;
        out[6] = E;
        out[7] = E;
        out[8] = E;
      }
      return out;
    }

    // wide, tall?
    const scalers = {
      none: { label: 'None', factor: 1 },
      '2x': { label: '2x', factor: 2, func: scale2x },
      '3x': { label: '3x', factor: 3, func: scale3x },
      eagle2x: { label: 'Eagle2x', factor: 2, func: scaleEagle2x },
      eagle3x: { label: 'Eagle3x', factor: 3, func: scaleEagle3x },
      scale2x: { label: 'Scale2x', factor: 2, func: scaleScale2x },
      scale3x: { label: 'Scale3x', factor: 3, func: scaleScale3x }
    };

    function scale(src, dest, scaler) {
      for (let y = 0; y < src.height; y++) {
        for (let x = 0; x < src.width; x++) {
          const scaled = scaler.func(src, x, y);
          let i = 0;
          for (let yy = 0; yy < scaler.factor; yy++) {
            for (let xx = 0; xx < scaler.factor; xx++) {
              putPixel(dest, x * scaler.factor + xx, y * scaler.factor + yy, scaled[i]);
              i++;
            }
          }
        }
      }
    }

    const falloffs = {
      constant: { label: 'Constant', func: function (x) {
        return 1.0;
      }},
      linear: { label: 'Linear', func: function (x) {
        return Math.max(0, Math.min(x, 1.0));
      }},
      cosine: { label: 'Cosine', func: function (x) {
        return (1.0 - Math.cos(x * Math.PI)) * 0.5;
      }},
      spherical: { label: 'Spherical', func: function (x) {
        return Math.sqrt(1.0 - ((1.0 - x) * (1.0 - x)));
      }}
    };

    function lerp(start, end, pos) {
      return start + (end - start) * pos;
    }

    function bias(b, value) {
      // y(x) = x^(log(B)/log(0.5))
      return Math.pow(value, Math.log(b) / Math.log(0.5));
    }

    function gain(g, value) {
      // y(x) =    Bias(2*x, 1-G)/2        if x<0.5
      //           1-Bias(2-2*x, 1-G)/2    if x>0.5
      return value <= 0.5 ? bias(2 * value, 1 - g) / 2 : 1 - bias(2 - 2 * value, 1 - g) / 2;
    }

    function intRandom(max) {
      return Math.floor(random() * (max + 1)) % (max + 1);
    }

    function pickRandom(array) {
      return array[intRandom(array.length - 1)];
    }

    const neighbourOffsets = [[-1, -1], [0, -1], [+1, -1], [+1, 0], [+1, +1], [0, +1], [-1, +1], [-1, 0]];

    function getNeighbours(data, x, y) {
      const neighbours = new Array();
      for(let i = 0; i < 8; i++) {
        neighbours[i] = getPixel(data, x + neighbourOffsets[i][0], y + neighbourOffsets[i][1]);
      }
      return neighbours;
    }

    const palettes = {
      arne: { label: 'Arne\'s', background: 0, colours: [
        [  0,   0,   0], [157, 157, 157], [255, 255, 255], [190,  38,  51],
        [224, 111, 139], [ 73,  60,  43], [164, 100,  34], [235, 137,  49],
        [247, 226, 107], [ 47,  72,  78], [ 68, 137,  26], [163, 206,  39],
        [ 27,  38,  50], [  0,  87, 132], [ 49, 162, 242], [178, 220, 239]
      ]},
      dawnbringer: { label: 'DawnBringer\'s', background: 0, colours: [
        [ 20,  12,  28], [ 68,  36,  52], [ 48,  52, 109], [ 78,  74,  78],
        [133,  76,  48], [ 52, 101,  36], [208,  70,  72], [117, 113,  97],
        [ 89, 125, 206], [210, 125,  44], [133, 149, 161], [109, 170,  44],
        [210, 170, 153], [109, 194, 202], [218, 212,  94], [222, 238, 214]
      ]},
      c64: { label: 'Commodore 64', background: 0, colours: [
        [  0,   0,   0], [ 62,  49, 162], [ 87,  66,   0], [140,  62,  52],
        [ 84,  84,  84], [141,  71, 179], [144,  95,  37], [124, 112, 218],
        [128, 128, 128], [104, 169,  65], [187, 119, 109], [122, 191, 199],
        [171, 171, 171], [208, 220, 113], [172, 234, 136], [255, 255, 255]
      ]},
      ega: { label: 'EGA', background: 0, colours: [
        [  0,   0,   0], [  0,   0, 168], [  0, 168,   0], [  0, 168, 168],
        [168,   0,   0], [168,   0, 168], [168,  84,   0], [168, 168, 168],
        [ 84,  84,  84], [ 84,  84, 252], [ 84, 252,  84], [ 84, 252, 252],
        [252,  84,  84], [252,  84, 252], [252, 252,  84], [252, 252, 252]
      ]},
      nes: { label: 'NES', background: 63, colours: [
        [255, 255, 255], [255, 255, 255], [199, 199, 199], [128, 128, 128],
        [166, 252, 255], [ 15, 215, 255], [  0, 119, 255], [  0,  61, 166],
        [179, 236, 255], [105, 162, 255], [ 33,  85, 255], [  0,  18, 176],
        [218, 171, 235], [212, 128, 255], [130,  55, 250], [ 68,   0, 150],
        [255, 168, 249], [255,  69, 243], [235,  47, 181], [161,   0,  94],
        [255, 171, 179], [255,  97, 139], [255,  41,  80], [199,   0,  40],
        [255, 210, 176], [255, 136,  51], [255,  34,   0], [186,   6,   0],
        [255, 239, 166], [255, 156,  18], [214,  50,   0], [140,  23,   0],
        [255, 247, 156], [250, 188,  32], [196,  98,   0], [ 92,  47,   0],
        [215, 232, 149], [159, 227,  14], [ 53, 128,   0], [ 16,  69,   0],
        [166, 237, 175], [ 43, 240,  53], [  5, 143,   0], [  5,  74,   0],
        [162, 242, 218], [ 12, 240, 164], [  0, 138,  85], [  0,  71,  46],
        [153, 255, 252], [  5, 251, 255], [  0, 153, 204], [  0,  65, 102],
        [221, 221, 221], [ 94,  94,  94], [ 33,  33,  33], [  0,   0,   0]
      ]},
      gameboy: { label: 'Gameboy', background: 0, colours: [
        [ 57,  57,  41], [123, 115,  99], [181, 165, 107], [231, 214, 156]
      ]},
      greys: { label: 'Greys', background: 0, colours: [
        //[ 31,  31,  31], [ 63,  63,  63], [ 95,  95,  95], [127, 127, 127],
        //[159, 159, 159], [191, 191, 191], [223, 223, 223], [255, 255, 255],
        //[  0,   0,   0], [ 85,  85,  85], [170, 170, 170], [255, 255, 255],
        [  0,   0,   0], [ 34,  34,  34], [ 73,  73,  73], [109, 109, 109],
        [146, 146, 146], [182, 182, 182], [219, 219, 219], [255, 255, 255]
      ]},
      primaries: { label: 'Primaries', background: 0, colours: [
        [  0,   0,   0], [255,   0,   0], [  0, 255,   0], [  0,   0, 255],
        [255, 255, 255]
      ]},
      secondaries: { label: 'Secondaries', background: 0, colours: [
        [  0,   0,   0], [255,   0,   0], [255, 255,   0], [  0, 255,   0],
        [  0, 255, 255], [  0,   0, 255], [255,   0, 255], [255, 255, 255]
      ]},
      tertiaries: { label: 'Tertiaries', background: 0, colours: [
        [  0,   0,   0], [255,   0,   0], [255, 127,   0], [255, 255,   0],
        [127, 255,   0], [  0, 255,   0], [  0, 255, 127], [  0, 255, 255],
        [  0, 127, 255], [  0,   0, 255], [127,   0, 255], [255,   0, 255],
        [255, 127, 127], [255, 255, 255]
      ]}
    };

    function SpriteGenerator(options = {}) {
      this.options = {};
      for(const key in properties) {
        this.options[key] = properties[key].default;
      }
      this.options = Object.assign(this.options, options);

      randomReseed(this.options.seed);

      // setup canvas
      this.canvas = elt;
      this.context = this.canvas.getContext('2d');
      this.context.mozImageSmoothingEnabled = false;
    }

    SpriteGenerator.prototype.generateTile = function () {
      const tile = this.context.createImageData(this.options['size'], this.options['size']);
      const doMirrorH = (random() <= this.options['mirrorh']);
      const doMirrorV = (random() <= this.options['mirrorv']);
      const xRange = tile.width / 2;
      const yRange = tile.height / 2;
      let xLimit = ( doMirrorH ? Math.ceil(xRange) : tile.width);
      let yLimit = ( doMirrorV ? Math.ceil(yRange) : tile.height);
      const spritePal = [];
      for (let i = 0; i < this.options['colours']; i++) {
        spritePal[i] = pickRandom(palettes[this.options['pal']].colours);
      }
      // draw unique
      for(let y = 0; y < yLimit; y++) {
        for(let x = 0; x < xLimit; x++) {
          const falloffX = falloffs[this.options['falloff']].func(1.0 - Math.abs((xRange - (x + 0.5)) / xRange));
          const falloffY = falloffs[this.options['falloff']].func(1.0 - Math.abs((yRange - (y + 0.5)) / yRange));
          const prob = lerp(this.options['probmin'], this.options['probmax'], bias(this.options['bias'], gain(this.options['gain'], falloffX * falloffY)));
          const rand = random();
          if(rand <= prob)
            putPixel(tile, x, y, rgbToRgba(pickRandom(spritePal)));
          else
            putPixel(tile, x, y, [255, 255, 255, 0]);
        }
      }
      // do post
      for(let y = 0; y < yLimit; y++) {
        for(let x = 0; x < xLimit; x++) {
          const neighbours = getNeighbours(tile, x, y);
          let count = 0;
          for(let i = 0; i < neighbours.length; i++) {
            if(!isUndefined(neighbours[i]) && !coloursEqual([255, 255, 255, 0], neighbours[i]))
              count++;
          }
          if(count === 1) {
            // despur
            if(random() <= this.options['despur']) {
              putPixel(tile, x, y, [255, 255, 255, 0]);
            }
          } else if(count === 0) {
            // despeckle
            if(random() <= this.options['despeckle']) {
              putPixel(tile, x, y, [255, 255, 255, 0]);
            }
          }
        }
      }
      // copy mirrors
      xLimit = ( doMirrorH ? Math.floor(xRange + 0.5) : tile.width);
      yLimit = ( doMirrorV ? Math.floor(yRange + 0.5) : tile.height);
      for(let y = 0; y < yLimit; y++) {
        for(let x = 0; x < xLimit; x++) {
          const colour = getPixel(tile, x, y);
          if(doMirrorH)
            putPixel(tile, tile.width - 1 - x, y, colour);
          if(doMirrorV)
            putPixel(tile, x, tile.height - 1 - y, colour);
          if(doMirrorH && doMirrorV)
            putPixel(tile, tile.width - 1 - x, tile.height - 1 - y, colour);
        }
      }
      // scaling
      let out = tile;
      if (this.options['scaler0'] !== 'none') {
        const scaler = scalers[this.options['scaler0']];
        const scaled = this.context.createImageData(out.width * scaler.factor, out.height * scaler.factor);
        scale(out, scaled, scaler);
        out = scaled;
      }
      if (this.options['scaler1'] !== 'none') {
        const scaler = scalers[this.options['scaler1']];
        const scaled = this.context.createImageData(out.width * scaler.factor, out.height * scaler.factor);
        scale(out, scaled, scaler);
        out = scaled;
      }
      return out;
    };

    SpriteGenerator.prototype.draw = function () {
      const tile = this.generateTile();
      this.context.putImageData(tile, this.options['spacing'], this.options['spacing']);
    };

    SpriteGenerator.prototype.getScale = function () {
      return scalers[this.options['scaler0']].factor * scalers[this.options['scaler1']].factor /** this.options["iterations"]*/;
    };

    const properties = {
      seed: { type: 'integer', label: 'Seed', default: 0, description: 'Seed value for PRNG.' },
      pal: { type: 'list', label: 'Palette', default: 'arne', options: palettes, description: 'Palette to draw colours from.' },
      colours: { type: 'integer', label: 'Colours', default: 3, min: 1, max: 16, description: 'Number of colours per sprite.' },
      size: { type: 'integer', label: 'Size', default: 16, min: 2, max: 64 },
      spacing: { type: 'integer', label: 'Spacing', default: 0, min: 0, max: 64 },
      zoom: { type: 'integer', label: 'Zoom', default: 1, min: 1, max: 16 },
      scaler0: { type: 'list', label: 'Scaler 0', default: 'eagle2x', options: scalers, description: 'First sprite scaling method.' },
      scaler1: { type: 'list', label: 'Scaler 1', default: 'none', options: scalers, description: 'Second sprite scaling method.' },
      falloff: { type: 'list', label: 'Falloff', default: 'linear', options: falloffs, description: 'Probability distribution function determining pixel placement across the sprite.' },
      probmin: { type: 'real', label: 'Min', default: 0.0, min: 0, max: 1, description: 'Probability of pixel placement at the edge of the sprite.' },
      probmax: { type: 'real', label: 'Max', default: 1.0, min: 0, max: 1, description: 'Probability of pixel placement at the centre of the sprite.' },
      bias: { type: 'real', label: 'Bias', default: 0.5, min: 0, max: 1, description: 'Perlin\'s bias function. Bends value toward or away from the extremes.' },
      gain: { type: 'real', label: 'Gain', default: 0.5, min: 0, max: 1, description: 'Perlin\'s gain function. Bends value toward or away from the centre.' },
      mirrorh: { type: 'real', label: 'Horizontal', default: 0.75, min: 0, max: 1, description: 'Probability of the sprite being horizontally mirrored.' },
      mirrorv: { type: 'real', label: 'Vertical', default: 0.25, min: 0, max: 1, description: 'Probability of the sprite being vertically mirrored.' },
      despeckle: { type: 'real', label: 'Despeckle', default: 0.875, min: 0, max: 1, description: 'Probability of a single pixel being despeckled.' },
      despur: { type: 'real', label: 'Despur', default: 0.5, min: 0, max: 1, description: 'Probability of a single jutting pixel being removed.' }
    };

    const spriteGen = new SpriteGenerator(props);
    spriteGen.draw();
    return elt.toDataURL();
  }
}
