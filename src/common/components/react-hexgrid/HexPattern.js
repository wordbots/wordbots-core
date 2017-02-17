import React from 'react';

import Sprite from '../game/Sprite';

import HexUtils from './HexUtils';

const { object, string } = React.PropTypes;

class HexPattern extends React.Component {
  piecePattern() {
    const id = HexUtils.getID(this.props.hex);

    if (this.props.pieceImg && this.props.images[this.props.pieceImg]) {
      return (
        <pattern id={id + '_piece'} height="100%" width="100%"
          patternContentUnits="objectBoundingBox" viewBox="-0.1 -0.05 1 1"
          preserveAspectRatio="xMidYMid">
          <image xlinkHref={this.props.images[this.props.pieceImg]} width="0.8" height="0.8" preserveAspectRatio="xMidYMid"/>
        </pattern>
      );
    } else if (this.props.pieceName) {
      return (
        <pattern id={id + '_piece'} height="100%" width="100%"
          patternContentUnits="objectBoundingBox" viewBox="0 0 1 1"
          preserveAspectRatio="xMidYMid">
          <Sprite id={this.props.pieceName} size={24} spacing={6} output="svg" />
        </pattern>
      );
    }
  }

  fillPattern() {
    const id = HexUtils.getID(this.props.hex);
    const fillImage = this.props.fill ? this.props.images[this.props.fill + '_tile'] : '';

    return (
      <pattern id={id} patternUnits="userSpaceOnUse" x="-15" y="-10" width="30" height="20">
        <image xlinkHref={fillImage} x="0" y="0" width="30" height="20" />
      </pattern>
    );
  }

  render() {
    return (
      <defs>
        {this.fillPattern()}
        {this.piecePattern()}
      </defs>
    );
  }
}

HexPattern.propTypes = {
  hex: object.isRequired,
  fill: string,
  pieceName: string,
  pieceImg: string,
  images: object
};

export default HexPattern;
