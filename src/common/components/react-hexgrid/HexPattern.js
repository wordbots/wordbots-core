import React from 'react';
const { object, string, bool } = React.PropTypes
import HexUtils from './HexUtils';

class HexPattern extends React.Component {

  render() {
    let hex = this.props.hex;
    let fillImage = '';
    let pieceImage = '';
    let id = HexUtils.getID(hex);

    if (this.props.fill === 'blue') {
      fillImage = require('./blue_tile.png');
    } else if (this.props.fill === 'red') {
      fillImage = require('./red_tile.png');
    }

    if (this.props.piece) {
      pieceImage = require('./' + this.props.piece + '.png');
    }

    return (
      <defs>
        <pattern id={id} patternUnits="userSpaceOnUse" x="-15" y="-10" width="30" height="20">
          <image xlinkHref={fillImage} x="0" y="0" width="30" height="20" />
        </pattern>
        <pattern id={id + '_piece'} height="100%" width="100%" 
          patternContentUnits="objectBoundingBox" viewBox="-0.1 -0.05 1 1" 
          preserveAspectRatio="xMidYMid">
          <image xlinkHref={pieceImage} width="0.8" height="0.8" preserveAspectRatio="xMidYMid"/>
        </pattern>
      </defs>
    );
  }
}

HexPattern.propTypes = {
  hex: object.isRequired,
  fill: string,
  piece: string
};

export default HexPattern;
