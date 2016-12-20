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

  render() {
    let hex = this.props.hex;
    let text = (hex.props.text) ? hex.props.text : HexUtils.getID(hex);
    let actions = this.props.actions;
    let styles = this.getStyles(hex);
    let pieceStyles = this.getPieceStyles(hex);
    let points = this.getPoints(hex);
    let piecePoints = this.getPiecePoints(hex);

    return (
      <g className="shape-group" transform={this.translate()} draggable="true"
        onMouseEnter={e => actions.onMouseEnter(this.props.hex, e)}
        onMouseLeave={e => actions.onMouseLeave(this.props.hex, e)}
        onClick={e => actions.onClick(this.props.hex, e)}
        >
        <HexPattern hex={hex} fill={this.props.fill} piece={this.props.piece} />
        <polygon points={points} style={{...styles}} />
        <polygon points={piecePoints} style={{...pieceStyles}} />
        <HexPointers hex={hex} points={points} />
        <text x="0" y="0.3em" textAnchor="middle">{text}</text>
      </g>
    );
  }
}
HexShape.propTypes = {
  hex: object.isRequired,
  layout: object.isRequired,
  actions: object.isRequired,
  fill: string,
  piece: string
};

export default HexShape;
