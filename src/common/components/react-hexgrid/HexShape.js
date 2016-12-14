import React from 'react';
const { object } = React.PropTypes
import HexPattern from './HexPattern';
import HexPointers from './HexPointers';
import HexUtils from './HexUtils';

class HexShape extends React.Component {

  getPoints(hex) {
    let points = this.props.layout.getPolygonPoints(hex)

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

  render() {
    let hex = this.props.hex;
    let text = (hex.props.text) ? hex.props.text : HexUtils.getID(hex);
    let actions = this.props.actions;
    let styles = this.getStyles(hex);
    let points = this.getPoints(hex);

    return (
      <g className="shape-group" transform={this.translate()} draggable="true"
        onMouseEnter={e => actions.onMouseEnter(this.props.hex, e)}
        onMouseLeave={e => actions.onMouseLeave(this.props.hex, e)}
        onClick={e => actions.onClick(this.props.hex, e)}
        >
        <HexPattern hex={hex} fill={this.props.fill} />
        <polygon points={points} style={{...styles}} />
        <HexPointers hex={hex} points={points} />
        <text x="0" y="0.3em" textAnchor="middle">{text}</text>
      </g>
    );
  }
}
HexShape.propTypes = {
  hex: object.isRequired,
  layout: object.isRequired,
  actions: object.isRequired
};

export default HexShape;
