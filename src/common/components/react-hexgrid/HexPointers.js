import React, { Component } from 'react';
import { object, string } from 'prop-types';
import { isUndefined } from 'lodash';

export default class HexPointers extends Component {
  static propTypes = {
    hex: object.isRequired,
    points: string.isRequired
  };

  createPointerPolygon(corner1, corner2) {
    const p1 = corner1.split(',');
    const p2 = corner2.split(',');
    const a = { x: parseFloat(p1[0]), y: parseFloat(p1[1]) };
    const b = { x: parseFloat(p2[0]), y: parseFloat(p2[1]) };
    const c = { x: (a.x+b.x)/2, y: (a.y+b.y)/2 };

    const x = { x: (b.x+c.x)*0.7, y: (b.y+c.y)*0.7 };

    // Construct the points to polygon string
    return [b, c, x].map(p => `${p.x },${ p.y}`).join(' ');
  }

  createPointerArc(corner1, corner2) {
    const c1 = corner1.split(',');
    const c2 = corner2.split(',');
    const p1 = { x: parseFloat(c1[0]), y: parseFloat(c1[1]) };
    const p2 = { x: parseFloat(c2[0]), y: parseFloat(c2[1]) };

    const a = { x: (p1.x+p2.x)/2, y: (p1.y+p2.y)/2 };
    const b = p2;

    const size = 1.2;
    const ax = { x: a.x*size, y: a.y*size };
    const bx = { x: b.x*size, y: b.y*size };

    return `M${a.x},${a.y} C${ax.x},${ax.y} ${bx.x},${bx.y} ${b.x},${b.y}`;
  }

  render() {
    const hex = this.props.hex;
    if (hex.props === {} || isUndefined(hex.props.arrows))
      return null;

    const arrows = hex.props.arrows;
    const points = this.props.points.split(' ');

    const polygons = points.map((point, index) => {
      if (arrows[index]) {
        const nextPoint = (index === points.length-1) ? points[0] : points[index+1];
        // return this.createPointerPolygon(point, nextPoint);
        return this.createPointerArc(point, nextPoint);
      }
    });

    return (
      <g>
        {polygons.map((polygonPoints, idx) => <path key={idx} d={polygonPoints} />)}
      </g>
    );
  }
}
