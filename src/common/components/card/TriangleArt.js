import React, { PureComponent } from 'react';
import { number, string } from 'prop-types';
import trianglify from 'trianglify';

export default class TriangleArt extends PureComponent {
  static propTypes = {
    id: string,
    width: number,
    height: number,
    cellSize: number
  };

  get opts() {
    return {
      seed: this.props.id,
      width: this.props.width,
      height: this.props.height,
      cell_size: this.props.cellSize
    };
  }

  render = () => (
    <img
      src={trianglify(this.opts).png()}
      width={this.props.width}
      height={this.props.height}
      style={{imageRendering: 'pixelated'}} />
  )
}
