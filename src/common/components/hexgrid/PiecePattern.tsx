import * as React from 'react';

import Sprite from '../Sprite';

import { isSpriteImage } from './guards';
import loadImages from './HexGridImages';
import { PieceOnBoard, PreLoadedImageName } from './types';

interface PiecePatternProps {
  piece: PieceOnBoard
}

export default class PiecePattern extends React.Component<PiecePatternProps> {
  get images(): Record<PreLoadedImageName, any> {
    return loadImages();
  }

  get imageElt(): JSX.Element | undefined {
    const { image, type } = this.props.piece;

    if (image) {
      if (isSpriteImage(image)) {
        return <Sprite id={image.sprite} size={24} spacing={6} output="svg" palette={type === TYPE_STRUCTURE ? 'greys' : 'nes'} />;
      } else if (image.img && this.images[image.img]) {
        // (only kernels have static images)
        return <image xlinkHref={this.images[image.img]} width="0.6" height="0.6" x="0.2" y="0.25" style={{ imageRendering: 'pixelated' }} />;
      }
    }
  }

  public render(): JSX.Element | null {
    const { id } = this.props.piece;
    const renderedImage = this.imageElt;

    if (renderedImage) {
      return (
        <defs>
          <pattern
            id={`${id}-pattern`}
            width="100%"
            height="100%"
            patternContentUnits="objectBoundingBox"
            viewBox={'0 0 1 1'}
            preserveAspectRatio="xMidYMid"
          >
            {renderedImage}
          </pattern>
        </defs>
      );
    } else {
      return null;
    }
  }
}
