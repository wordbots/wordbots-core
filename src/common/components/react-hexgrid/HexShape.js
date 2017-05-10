import React from 'react';
import { bool, object, string } from 'prop-types';
import { isUndefined } from 'lodash';

import HexPattern from './HexPattern';
import HexPointers from './HexPointers';
import HexUtils from './HexUtils';

export default class HexShape extends React.Component {
  static propTypes = {
    hex: object.isRequired,
    layout: object.isRequired,
    actions: object.isRequired,
    fill: string,
    images: object,
    pieceImg: object,
    pieceStats: object,
    selected: bool
  };

  get points() {
    const points = this.props.layout.getPolygonPoints(this.props.hex);
    return points.map(point => `${point.x},${point.y}`).join(' ');
  }

  get piecePoints() {
    const points = this.props.layout.getPolygonPoints(this.props.hex);

    if (this.props.pieceImg) {
      // Old hex coords - for kernels & other things with static art.

      points[4].y = points[4].y * 1.5;
      points[5].y = points[5].y * 1.5;

      return points.map(point => `${point.x},${point.y}`).join(' ');
    } else {
      // New hex coords - for sprites.

      points[4].y = points[4].y + 2;
      points[5].y = points[5].y + 2;

      return points.map(point => `${point.x},${point.y - 2}`).join(' ');
    }
  }

  get translate() {
    const hex = this.props.hex;
    const pixel = HexUtils.hexToPixel(hex, this.props.layout);
    return `translate(${pixel.x}, ${pixel.y})`;
  }

  get styles() {
    const hex = this.props.hex;

    if (this.props.selected) {
      return {
        stroke: '#999',
        strokeWidth: 0.5,
        fillOpacity: 0
      };
    } else if (this.props.fill || (hex.props !== {} && !isUndefined(hex.props.image))) {
      return {
        fill: `url(#${HexUtils.getID(hex)})`
      };
    } else {
      return {};
    }
  }

  get pieceStyles() {
    if (this.props.pieceImg !== {}) {
      return {
        fill: `url(#${HexUtils.getID(this.props.hex)}_piece)`,
        stroke: 'none'
      };
    } else {
      return {
        fillOpacity: 0,
        stroke: 'none'
      };
    }
  }

  renderHexPattern() {
    if (!this.props.selected) {
      return (
        <HexPattern
          hex={this.props.hex}
          fill={this.props.fill}
          pieceImg={this.props.pieceImg}
          images={this.props.images} />
      );
    } else {
      return null;
    }
  }

  renderPolygons() {
    const polygon = <polygon key="p1" points={this.points} style={this.styles} />;
    const piecePolygon = <polygon key="p2" points={this.piecePoints} style={this.pieceStyles} />;
    const hexPointers = <HexPointers hex={this.props.hex} points={this.points} />;

    if (this.props.selected) {
      return [polygon, hexPointers];
    } else {
      return [polygon, piecePolygon, hexPointers];
    }
  }

  renderPieceStats() {
    if (this.props.pieceStats) {
      if (this.props.pieceStats.attack !== undefined) {
        return (
          <g>
            <circle style={{
              fill: '#E57373'
            }} cx="-3" cy="2" r="2" />
            <text x="-3" y="3" textAnchor="middle" style={{
              fontFamily: 'Carter One',
              fontSize: '0.19em',
              fill: '#FFFFFF',
              fillOpacity: 1
            }}>{this.props.pieceStats.attack}</text>
            <circle style={{
              fill: '#81C784'
            }} cx="3" cy="2" r="2" />
            <text x="3" y="3" textAnchor="middle" style={{
              fontFamily: 'Carter One',
              fontSize: '0.19em',
              fill: '#FFFFFF',
              fillOpacity: 1
            }}>{this.props.pieceStats.health}</text>
          </g>
        );
      } else {
        return (
          <g>
            <circle style={{
              fill: '#81C784'
            }} cx="3" cy="2" r="2" />
            <text x="3" y="3" textAnchor="middle" style={{
              fontFamily: 'Carter One',
              fontSize: '0.19em',
              fill: '#FFFFFF',
              fillOpacity: 1
            }}>{this.props.pieceStats.health}</text>
          </g>
        );
      }
    } else {
      return null;
    }
  }

  render() {
    const text = this.props.hex.props.text || ''; //HexUtils.getID(this.props.hex);
    return (
      <g
        draggable
        className="shape-group"
        transform={this.translate}
        onMouseEnter={e => this.props.actions.onHexHover(this.props.hex, e)}
        onMouseLeave={e => this.props.actions.onHexHover(this.props.hex, e)}
        onClick={e => this.props.actions.onClick(this.props.hex, e)}
      >
        {this.renderHexPattern()}
        {this.renderPolygons()}
        {this.renderPieceStats()}
        <text x="0" y="0.3em" textAnchor="middle">{text}</text>
      </g>
    );
  }
}
