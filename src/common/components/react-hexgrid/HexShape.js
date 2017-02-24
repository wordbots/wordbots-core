import React from 'react';

import HexPattern from './HexPattern';
import HexPointers from './HexPointers';
import HexUtils from './HexUtils';

const { object, string } = React.PropTypes;

class HexShape extends React.Component {
  getPoints(hex) {
    const points = this.props.layout.getPolygonPoints(hex);

    return points.map(point => `${point.x  },${  point.y}`).join(' ');
  }

  getPiecePoints(hex) {
    const points = this.props.layout.getPolygonPoints(hex);

    if (this.props.pieceImg) {
      // Old hex coords - for kernels & other things with static art.

      points[4].y = points[4].y * 1.5;
      points[5].y = points[5].y * 1.5;

      return points.map(point => `${point.x  },${  point.y}`).join(' ');
    } else {
      // New hex coords - for sprites.

      points[4].y = points[4].y + 2;
      points[5].y = points[5].y + 2;

      return points.map(point => `${point.x  },${  point.y - 2}`).join(' ');
    }
  }

  translate() {
    const hex = this.props.hex;
    const pixel = HexUtils.hexToPixel(hex, this.props.layout);
    return `translate(${pixel.x}, ${pixel.y})`;
  }

  getStyles(hex) {
    if (this.props.fill || (hex.props !== {} && typeof(hex.props.image) !== 'undefined')) {
      return {
        fill: `url(#${ HexUtils.getID(hex) })`
      };
    } else {
      return {};
    }
  }

  getPieceStyles(hex) {
    if (this.props.pieceName) {
      return {
        fill: `url(#${ HexUtils.getID(hex) }_piece)`,
        stroke: 'none'
      };
    } else {
      return {
        fillOpacity: 0,
        stroke: 'none'
      };
    }
  }

  getPieceStats() {
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
    const hex = this.props.hex;
    const text = (hex.props.text) ? hex.props.text : HexUtils.getID(hex);
    const actions = this.props.actions;
    const styles = this.getStyles(hex);
    const pieceStyles = this.getPieceStyles(hex);
    const points = this.getPoints(hex);
    const piecePoints = this.getPiecePoints(hex);
    const pieceStats = this.getPieceStats();

    return (
      <g className="shape-group" transform={this.translate()} draggable="true"
        onMouseEnter={e => actions.onMouseEnter(this.props.hex, e)}
        onMouseLeave={e => actions.onMouseLeave(this.props.hex, e)}
        onClick={e => actions.onClick(this.props.hex, e)}
        >
        <HexPattern
          hex={hex}
          fill={this.props.fill}
          pieceName={this.props.pieceName}
          pieceImg={this.props.pieceImg}
          images={this.props.images} />
        <polygon points={points} style={{...styles}} />
        <polygon points={piecePoints} style={{...pieceStyles}} />
        <HexPointers hex={hex} points={points} />
        <text x="0" y="0.3em" textAnchor="middle">{text}</text>
        {pieceStats}
      </g>
    );
  }
}
HexShape.propTypes = {
  hex: object.isRequired,
  layout: object.isRequired,
  actions: object.isRequired,
  fill: string,
  images: object,
  pieceName: string,
  pieceImg: string,
  pieceStats: object
};

export default HexShape;
