import React from 'react';
const { object, string } = React.PropTypes
import HexPattern from './HexPattern';
import HexPointers from './HexPointers';
import HexUtils from './HexUtils';

class HexShape extends React.Component {
  getPoints(hex) {
    let points = this.props.layout.getPolygonPoints(hex);

    return points.map(point => {
      return point.x + ',' + point.y;
    }).join(' ');
  }

  getPiecePoints(hex) {
    let points = this.props.layout.getPolygonPoints(hex);

    points[4].y = points[4].y * 1.5;
    points[5].y = points[5].y * 1.5;

    return points.map(point => {
      return point.x + ',' + point.y;
    }).join(' ');
  }

  translate() {
    let hex = this.props.hex;
    let pixel = HexUtils.hexToPixel(hex, this.props.layout);
    return `translate(${pixel.x}, ${pixel.y})`;
  }

  getStyles(hex) {
    if (this.props.fill || (hex.props != {} && typeof(hex.props.image) !== 'undefined')) {
      return {
        fill: 'url(#'+ HexUtils.getID(hex) +')'
      };
    } else {
      return {};
    }
  }

  getPieceStyles(hex) {
    if (this.props.piece) {
      return {
        fill: 'url(#'+ HexUtils.getID(hex) +'_piece)',
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
    if (this.props.piece) {
      if (this.props.pieceStats.attack) {
        return (
          <g>
            <circle style={{
              fill: '#E57373'
            }} cx="-3" cy="2" r="2" />
            <text x="-3" y="3" textAnchor="middle" style={{
              fontFamily: 'Luckiest Guy',
              fontSize: '0.19em',
              fill: '#FFFFFF',
              fillOpacity: 1
            }}>{this.props.pieceStats.attack}</text>
            <circle style={{
              fill: '#81C784'
            }} cx="3" cy="2" r="2" />
            <text x="3" y="3" textAnchor="middle" style={{
              fontFamily: 'Luckiest Guy',
              fontSize: '0.19em',
              fill: '#FFFFFF',
              fillOpacity: 1
            }}>{this.props.pieceStats.health}</text>
          </g>
        )
      } else {
        return (
          <g>
            <circle style={{
              fill: '#81C784'
            }} cx="3" cy="2" r="2" />
            <text x="3" y="3" textAnchor="middle" style={{
              fontFamily: 'Luckiest Guy',
              fontSize: '0.19em',
              fill: '#FFFFFF',
              fillOpacity: 1
            }}>{this.props.pieceStats.health}</text>
          </g>
        )
      }
    } else {
      return null;
    }
  }

  render() {
    let hex = this.props.hex;
    let text = (hex.props.text) ? hex.props.text : HexUtils.getID(hex);
    let actions = this.props.actions;
    let styles = this.getStyles(hex);
    let pieceStyles = this.getPieceStyles(hex);
    let points = this.getPoints(hex);
    let piecePoints = this.getPiecePoints(hex);
    let pieceStats = this.getPieceStats();

    return (
      <g className="shape-group" transform={this.translate()} draggable="true"
        onMouseEnter={e => actions.onMouseEnter(this.props.hex, e)}
        onMouseLeave={e => actions.onMouseLeave(this.props.hex, e)}
        onClick={e => actions.onClick(this.props.hex, e)}
        >
        <HexPattern hex={hex} fill={this.props.fill} piece={this.props.piece} images={this.props.images}/>
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
  piece: string,
  images: object,
  pieceStats: object
};

export default HexShape;
