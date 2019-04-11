import * as React from 'react';
import trianglify from 'trianglify';

import { inBrowser } from '../../util/browser';

interface TriangleArtProps {
  id: string
  width: number
  height: number
  cellSize: number
}

interface TrianglifyOpts {
  seed: string
  width: number
  height: number
  cell_size: number
  y_colors: string
}

export default class TriangleArt extends React.PureComponent<TriangleArtProps> {
  // Simple random number seeded by id.
  get rand(): number {
    return (parseInt(this.props.id, 36) % 1000000) / 1000000;
  }

  get opts(): TrianglifyOpts {
    const cellSizeVariance = (0.5 + this.rand * 1.5);  // (between 0.5 and 2)

    return {
      seed: this.props.id,
      width: this.props.width,
      height: this.props.height,
      cell_size: this.props.cellSize * cellSizeVariance,
      y_colors: 'random'
    };
  }

  public render(): JSX.Element {
    return (
      <img
        src={inBrowser() ? trianglify(this.opts).png() : ''}
        width={this.props.width}
        height={this.props.height}
        style={{imageRendering: 'pixelated'}}
      />
    );
  }
}
