import React from 'react';
import { bool, object, string } from 'prop-types';
import { isUndefined } from 'lodash';

import { DISPLAY_HEX_IDS } from '../../constants';
import TutorialTooltip from '../game/TutorialTooltip';

import HexPattern from './HexPattern';
import HexPointers from './HexPointers';
import HexUtils from './HexUtils';

export default class HexShape extends React.Component {
  static propTypes = {
    hex: object.isRequired,
    layout: object.isRequired,
    actions: object.isRequired,
    tooltip: object,
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

  get hexStyles() {
    const hex = this.props.hex;

    if (this.props.selected) {
      return {
        stroke: '#666',
        strokeWidth: 0.6,
        fillOpacity: 0
      };
    } else {
      return {
        fill: `url(#${HexUtils.getID(hex)})`
      };
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

  get shouldRenderTooltip() {
    return HexUtils.getID(this.props.hex) === (this.props.tooltip || {}).hex;
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
    const hexPolygon = <polygon key="p1" points={this.points} style={this.hexStyles} />;
    const piecePolygon = <polygon key="p2" points={this.piecePoints} style={this.pieceStyles} />;
    const hexPointers = <HexPointers key="hp" hex={this.props.hex} points={this.points} />;

    if (this.props.selected) {
      return [hexPolygon, hexPointers];
    } else {
      return [hexPolygon, piecePolygon, hexPointers];
    }
  }

  renderStat(stat) {
    const value = this.props.pieceStats[stat];
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
    const stats = this.props.pieceStats;
    if (stats && !isUndefined(stats.attack)) {
      return [this.renderStat('attack'), this.renderStat('health')];
    } else if (stats && !isUndefined(stats.health)) {
      return this.renderStat('health');
    } else {
      return null;
    }
  }

  renderText() {
    const text = (DISPLAY_HEX_IDS && HexUtils.getID(this.props.hex)) || this.props.hex.props.text || '';
    return <text x="0" y="0.3em" textAnchor="middle">{text}</text>;
  }

  renderHex() {
    return (
      <g
        draggable
        transform={this.translate}
        onMouseEnter={e => this.props.actions.onHexHover(this.props.hex, e)}
        onMouseLeave={e => this.props.actions.onHexHover(this.props.hex, e)}
        onClick={e => this.props.actions.onClick(this.props.hex, e)}
      >
        {this.renderHexPattern()}
        {this.renderPolygons()}
        {this.renderPieceStats()}
        {this.renderText()}
      </g>
    );
  }

  render() {
    if (this.shouldRenderTooltip) {
      return (
        <TutorialTooltip text={this.props.tooltip.text}>
          {this.renderHex()}
        </TutorialTooltip>
      );
    } else {
      return this.renderHex();
    }
  }
}
