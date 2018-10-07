import * as React from 'react';
import { func, number, string } from 'prop-types';

import { TYPE_ROBOT, TYPE_CORE, TYPE_EVENT } from '../../constants.ts';
import loadImages from '../hexgrid/HexGridImages';
import Sprite from '../Sprite';

import Identicon from './Identicon';
import TriangleArt from './TriangleArt';

const CardImage = (props) => {
  if (props.type === TYPE_CORE) {
    const [width, height] = [50 * props.scale, 52 * props.scale];
    return (
      <div style={{
        width: width,
        height: height,
        margin: '3px auto 0'
      }}>
        <img src={loadImages()[props.img]} width={width} height={height} />
      </div>
    );
  } else if (props.type === TYPE_EVENT) {
    if (props.spriteV < 2 && props.source !== 'builtin') {
      // Legacy event images.
      const [width, height] = [25 * props.scale, 42 * props.scale];
      return (
        <div
          onClick={props.onSpriteClick}
          style={{
            width: width,
            height: height,
            margin: `${10 * props.scale}px auto 0`
        }}>
          <Identicon id={props.spriteID} width={width} size={4} />
        </div>
      );
    } else {
      const [width, height] = [140 * props.scale, 52 * props.scale];
      return (
        <div
          onClick={props.onSpriteClick}
          style={{
            width: width,
            height: height
        }}>
          <TriangleArt
            id={props.spriteID}
            width={width}
            height={height}
            cellSize={25 * props.scale} />
        </div>
      );
    }
  } else {
    return (
      <div
        onClick={props.onSpriteClick}
        style={{
          width: 48 * props.scale,
          height: 48 * props.scale,
          margin: '2px auto 3px'
      }}>
        <Sprite
          id={props.spriteID}
          palette={props.type === TYPE_ROBOT ? 'nes' : 'greys'}
          size={24}
          scale={props.scale}
          output="html" />
      </div>
    );
  }
};

CardImage.propTypes = {
  type: number,
  spriteID: string,
  spriteV: number,
  img: string,
  source: string,
  scale: number,

  onSpriteClick: func
};

export default CardImage;
