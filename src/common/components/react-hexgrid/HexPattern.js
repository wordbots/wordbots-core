import React, { Component } from 'react';
import { object, string } from 'prop-types';

import { TYPE_STRUCTURE } from '../../constants';
import Sprite from '../Sprite';

import HexUtils from './HexUtils';

export default class HexPattern extends Component {
  static propTypes = {
    hex: object.isRequired,
    fill: string,
    pieceImg: object,
    images: object
  };

  piecePattern() {
    const id = HexUtils.getID(this.props.hex);
    const image = this.props.pieceImg;

    if (image.img && this.props.images[image.img]) {
      return (
        <pattern id={`${id}_piece`} height="100%" width="100%"
          patternContentUnits="objectBoundingBox" viewBox="-0.1 -0.05 1 1"
          preserveAspectRatio="xMidYMid">
          <image xlinkHref={this.props.images[image.img]} width="0.8" height="0.8" preserveAspectRatio="xMidYMid"/>
        </pattern>
      );
    } else if (image.sprite) {
      return (
        <pattern id={`${id}_piece`} height="100%" width="100%"
          patternContentUnits="objectBoundingBox" viewBox="0 0 1 1"
          preserveAspectRatio="xMidYMid">
          <Sprite
            id={image.sprite}
            size={24}
            spacing={6}
            output="svg"
            palette={image.type === TYPE_STRUCTURE ? 'greys' : 'nes'} />
        </pattern>
      );
    }
  }

  fillPattern() {
    const id = HexUtils.getID(this.props.hex);
    const fillImage = this.props.fill ?
      this.props.images[`${this.props.fill  }_tile`] :
      this.props.images['floor'];

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
