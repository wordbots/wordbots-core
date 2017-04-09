// This is a cleaned-up version of gimenete's code from
// https://github.com/gimenete/identicons-react
// (released under MIT license).

// We can't use the identicons-react NPM package because
// it is improperly exported (as ES6 rather than ES5).

import React, { Component } from 'react';
import { number, string } from 'prop-types';

import { hashCode } from '../../util/common';

export default class Identicon extends Component {
  static propTypes = {
    id: string,
    width: number,
    size: number
  };

  generate(id, options, generator) {
    const size = options.size;
    const hash = options.hash || hashCode;
    const value = hash(id);
    const bin = value.toString(2);
    generator.start(value);
    let n = 0;
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size*2; y++) {
        if (+bin.charAt(n++ % bin.length)) {
          generator.rect(x, y);
          generator.rect(size*2-x-2, y);
        }
      }
    }
    generator.end();
  }

  render() {
    const width = this.props.width;
    const size = this.props.size;
    const side = width/((size*2)-1);
    let color;
    const rects = [];

    this.generate(this.props.id, this.props, {
      start: function (value) {
        color = `#${Math.abs(value).toString(16).substring(0, 6)}`;
      },
      rect: function (x, y) {
        const rect = React.createElement('rect', {
          key: String(rects.length),
          x: String(Math.floor(x*side)),
          y: String(Math.floor(y*side)),
          width: String(Math.ceil(side)),
          height: String(Math.ceil(side)),
          style: { fill: color }
        });
        rects.push(rect);
      },
      end: function () {
      }
    });
    return React.createElement('svg', {width: width}, rects);
  }
}
