import React from 'react';

import HexUtils from './HexUtils';

const { object, string } = React.PropTypes;

class HexPattern extends React.Component {
  render() {
    const hex = this.props.hex;
    const images = this.props.images;
    const fillImage = this.props.fill ? images[this.props.fill + '_tile'] : '';
    const id = HexUtils.getID(hex);

    let pieceImagePattern = null;

    if (this.props.pieceImg && images[this.props.pieceImg]) {
      pieceImagePattern = (
        <pattern id={id + '_piece'} height="100%" width="100%"
          patternContentUnits="objectBoundingBox" viewBox="-0.1 -0.05 1 1"
          preserveAspectRatio="xMidYMid">
          <image xlinkHref={images[this.props.pieceImg]} width="0.8" height="0.8" preserveAspectRatio="xMidYMid"/>
        </pattern>
      );
    } else if (this.props.pieceName) {
      const hash = Math.abs(this.props.pieceName.split('').reduce(function (a,b) {a=((a<<5)-a)+b.charCodeAt(0);return a&a;},0) * (32*32 + 1));
      const idx1 = hash % 32;
      const idx2 = Math.floor(hash / 32) % 32;

      pieceImagePattern = (
        <pattern id={id + '_piece'} height="100%" width="100%"
          patternContentUnits="objectBoundingBox" viewBox={`${idx1 * 42} ${idx2 * 42} 52 52`}
          preserveAspectRatio="xMidYMid">
          <image xlinkHref={images['spritesheet']} width="1354" height="1354" preserveAspectRatio="xMidYMid"/>
        </pattern>
      );
    }

    return (
      <defs>
        <pattern id={id} patternUnits="userSpaceOnUse" x="-15" y="-10" width="30" height="20">
          <image xlinkHref={fillImage} x="0" y="0" width="30" height="20" />
        </pattern>
        { pieceImagePattern }
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
