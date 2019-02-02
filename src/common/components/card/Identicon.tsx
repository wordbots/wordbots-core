// This is a cleaned-up version of gimenete's code from
// https://github.com/gimenete/identicons-react
// (released under MIT license).

// We can't use the identicons-react NPM package because
// it is improperly exported (as ES6 rather than ES5).

/* eslint-disable no-loops/no-loops */

import * as React from 'react';
import { noop } from 'lodash';

import { hashCode } from '../../util/common';

interface IdenticonProps {
  id: string
  width: number
  size: number
  hash?: (str: string) => number
}

interface Generator {
  start: (value: number) => void
  rect: (x: number, y: number) => void
  end: () => void
}

export default class Identicon extends React.Component<IdenticonProps> {
  public render(): JSX.Element {
    const width = this.props.width;
    const size = this.props.size;
    const side = width / ((size * 2) - 1);
    let color: string;
    const rects: JSX.Element[] = [];

    this.generate(this.props.id, this.props, {
      start: (value) => {
        color = `#${Math.abs(value).toString(16).substring(0, 6)}`;
      },
      rect: (x, y) => {
        const rect = React.createElement('rect', {
          key: String(rects.length),
          x: String(Math.floor(x * side)),
          y: String(Math.floor(y * side)),
          width: String(Math.ceil(side)),
          height: String(Math.ceil(side)),
          style: { fill: color }
        });
        rects.push(rect);
      },
      end: noop
    });
    return React.createElement('svg', { width }, rects);
  }

  private generate(id: string, options: IdenticonProps, generator: Generator): void {
    const size = options.size;
    const hashFn = options.hash || hashCode;
    const value = hashFn(id);
    const bin = value.toString(2);
    generator.start(value);
    let n = 0;
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size * 2; y++) {
        if (+bin.charAt(n++ % bin.length)) {
          generator.rect(x, y);
          generator.rect(size * 2 - x - 2, y);
        }
      }
    }
    generator.end();
  }
}
