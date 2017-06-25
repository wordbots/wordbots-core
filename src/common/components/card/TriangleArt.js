import React, { PureComponent } from 'react';
import { number, string } from 'prop-types';
import trianglify from 'trianglify';

import { inBrowser } from '../../util/common';

export default class TriangleArt extends PureComponent {
  static propTypes = {
    id: string,
    width: number,
    height: number,
    cellSize: number
  };

  // Simple random number seeded by id.
  get rand() {
    return (parseInt(this.props.id, 36) % 1000000) / 1000000;
  }

  get opts() {
    const cellSizeVariance = (0.5 + this.rand * 1.5);  // (between 0.5 and 2)

    return {
      seed: this.props.id,
      width: this.props.width,
      height: this.props.height,
      cell_size: this.props.cellSize * cellSizeVariance,
      y_colors: 'random'
    };
  }

  render = () => (
    <img
      src={inBrowser() ? trianglify(this.opts).png() : ''}
      width={this.props.width}
      height={this.props.height}
      style={{imageRendering: 'pixelated'}} />
  )
}
