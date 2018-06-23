import * as React from 'react';
import { object } from 'prop-types';
import { isUndefined } from 'lodash';

import { ANIMATION_TIME_MS } from '../../constants';

import PiecePattern from './PiecePattern';
import HexUtils from './HexUtils';

export default class HexPiece extends React.Component {
  static propTypes = {
    hex: object.isRequired,
    layout: object.isRequired,
    actions: object.isRequired,
    piece: object
  };

  get points() {
    const points = this.props.layout.getPolygonPoints(this.props.hex);

    if (this.props.piece.image) {
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
    const attackingHex = this.props.piece.attacking ? HexUtils.IDToHex(this.props.piece.attacking) : null;
    const renderedHex = attackingHex ? HexUtils.lerp(this.props.hex, attackingHex, 0.8) : this.props.hex;
    const pixel = HexUtils.hexToPixel(renderedHex, this.props.layout);
    return `translate(${pixel.x}, ${pixel.y})`;
  }

  get styles() {
    if (this.props.piece.image !== {}) {
      return {
        fill: `url(#${this.props.piece.id}-pattern)`,
        stroke: 'none'
      };
    } else {
      return {
        fillOpacity: 0,
        stroke: 'none'
      };
    }
  }

  handleMouseEnter = evt => this.props.actions.onHexHover(this.props.hex, evt);
  handleMouseLeave = evt => this.props.actions.onHexHover(this.props.hex, evt);
  handleClick = evt => this.props.actions.onClick(this.props.hex, evt);

  renderPattern() {
    return (
      <PiecePattern
        hex={this.props.hex}
        pieceImg={this.props.piece.image} />
    );
  }

  renderStat(stat) {
    const value = this.props.piece.stats[stat];
    const isLargeNumber = value >= 20;

    const xPos = {attack: -3, health: 3}[stat];
    const textStyle = {
      fontFamily: 'Carter One',
      fontSize: isLargeNumber ? '0.14em' : '0.18em',
      fill: '#FFFFFF',
      fillOpacity: 1
    };
    const circleStyle = {
      fill: {attack: '#E57373', health: '#81C784'}[stat],
      strokeWidth: 0.2,
      stroke: '#777'
    };

    return (
      <g key={stat}>
        <circle cx={xPos} cy="2" r="2" style={circleStyle} filter="url(#dropShadow)" />
        <text x={xPos} y={isLargeNumber ? 2.8 : 3} textAnchor="middle" style={textStyle}>
          {value}
        </text>
      </g>
    );
  }

  renderPieceStats() {
    const stats = this.props.piece.stats;
    if (stats && !isUndefined(stats.attack)) {
      return [this.renderStat('attack'), this.renderStat('health')];
    } else if (stats && !isUndefined(stats.health)) {
      return this.renderStat('health');
    } else {
      return null;
    }
  }

  render() {
    return (
      <g
        draggable
        transform={this.translate}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        onClick={this.handleClick}
        style={{
          transition: `transform ${ANIMATION_TIME_MS}ms ease-in-out, opacity ${ANIMATION_TIME_MS}ms ease-in-out`
      }}>
        <PiecePattern piece={this.props.piece} />
        <polygon key="p2" points={this.points} style={this.styles} />
        {this.renderPieceStats()}
      </g>
    );
  }
}
