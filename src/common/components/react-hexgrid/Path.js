import React, { Component } from 'react';
import { object } from 'prop-types';

import HexUtils from './HexUtils';

export default class Path extends Component {
  static propTypes = {
    start: object,
    end: object,
    layout: object.isRequired
  };

  getPoints() {
    if (!this.props.start || !this.props.end) {
      return '';
    }

    // Get all the intersecting hexes between start and end points
    const distance = HexUtils.distance(this.props.start, this.props.end);
    const intersects = [];
    const step = 1.0 / Math.max(distance, 1);
    for (let i=0; i<=distance; i++) {
      intersects.push(HexUtils.round(HexUtils.lerp(this.props.start, this.props.end, step * i)));
    }

    // Construct Path points out of all the intersecting hexes (e.g. M 0,0 L 10,20, L 30,20)
    let points = 'M';
    points += intersects.map(hex => {
      const p = HexUtils.hexToPixel(hex, this.props.layout);
      return ` ${p.x},${p.y} `;
    }).join('L');

    return points;
  }

  render() {
    return (
      <path d={this.getPoints()} />
    );
  }
}
