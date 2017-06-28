import React, { Component } from 'react';
import { object } from 'prop-types';

import { TYPE_STRUCTURE } from '../../constants';
import Sprite from '../Sprite';

import loadImages from './HexGridImages';

export default class PiecePattern extends Component {
  static propTypes = {
    piece: object.isRequired
  };

  get images() {
    return loadImages();
  }

  render() {
    const id = this.props.piece.id;
    const image = this.props.piece.image;

    if (image.img && this.images[image.img]) {
      return (
        <defs>
          <pattern id={`${id}-pattern`} height="100%" width="100%"
            patternContentUnits="objectBoundingBox" viewBox="-0.1 -0.05 1 1"
            preserveAspectRatio="xMidYMid">
            <image xlinkHref={this.images[image.img]} width="0.8" height="0.8" preserveAspectRatio="xMidYMid"/>
          </pattern>
        </defs>
      );
    } else if (image.sprite) {
      return (
        <defs>
          <pattern id={`${id}-pattern`} height="100%" width="100%"
            patternContentUnits="objectBoundingBox" viewBox="0 0 1 1"
            preserveAspectRatio="xMidYMid">
            <Sprite
              id={image.sprite}
              size={24}
              spacing={6}
              output="svg"
              palette={this.props.piece.type === TYPE_STRUCTURE ? 'greys' : 'nes'} />
          </pattern>
        </defs>
      );
    } else {
      return null;
    }
  }
}
