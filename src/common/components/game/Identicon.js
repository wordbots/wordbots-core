// This is a cleaned-up version of gimenete's code from
// https://github.com/gimenete/identicons-react
// (released under MIT license).

// We can't use the identicons-react NPM package because
// it is improperly exported (as ES6 rather than ES5).

import React, { Component } from 'react';

class Identicon extends Component {
  render() {
    let width = this.props.width;
    let size = this.props.size;
    let side = width/((size*2)-1);
    let color;
    let rects = [];

    generate(this.props.id, this.props, {
      start: function (value) {
        color = '#'+Math.abs(value).toString(16).substring(0, 6);
      },
      rect: function (x, y) {
        let rect = React.createElement('rect', {
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
    return React.createElement('svg', null, rects);
  }
}

Identicon.propTypes = {
  id: React.PropTypes.string,
  width: React.PropTypes.number,
  size: React.PropTypes.number
};

// Simple hash function
// see http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
function hashCode(s) {
  if (!s) return 0;
  let value = 0;
  for (let i = 0; i < s.length; i++) {
    let char = s.charCodeAt(i);
    value = ((value<<5)-value)+char;
    value = value & value;
  }
  return value;
}

function generate(id, options, generator) {
  let size = options.size;
  let hash = options.hash || hashCode;
  let value = hash(id);
  let bin = value.toString(2);
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

export default Identicon;

