import * as React from 'react';

import { isSpriteImage } from '../../guards';
import * as w from '../../types';
import Sprite from '../Sprite';

import loadImages from './HexGridImages';

interface PiecePatternProps {
  piece: w.PieceOnBoard
}

export default class PiecePattern extends React.Component<PiecePatternProps> {
  get images(): Record<w.PreLoadedImageName, any> {
    return loadImages();
  }

  get imageElt(): JSX.Element | undefined {
    const { image } = this.props.piece;

    if (image) {
      if (isSpriteImage(image)) {
        return <Sprite id={image.sprite} size={24} spacing={6} output="svg" palette="nes" />;
      } else if (image.img && this.images[image.img]) {
        return <image xlinkHref={this.images[image.img]} width="0.8" height="0.8" preserveAspectRatio="xMidYMid" />;
      }
    }
  }

  public render(): JSX.Element | null {
    const { id, image } = this.props.piece;
    const renderedImage = this.imageElt;

    if (renderedImage) {
      return (
        <defs>
          <pattern
            id={`${id}-pattern`}
            width="100%"
            height="100%"
            patternContentUnits="objectBoundingBox"
            viewBox={(!!image && isSpriteImage(image)) ? '0 0 1 1' : '-0.1 -0.05 1 1'}
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
