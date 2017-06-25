import React, { Component } from 'react';
import { func, number, string } from 'prop-types';

import { TYPE_ROBOT, TYPE_CORE, TYPE_EVENT } from '../../constants';
import loadImages from '../react-hexgrid/HexGridImages';
import Sprite from '../Sprite';

import Identicon from './Identicon';
import TriangleArt from './TriangleArt';

export default class CardImage extends Component {
  static propTypes = {
    type: number,
    spriteID: string,
    spriteV: number,
    img: string,
    source: string,
    scale: number,

    onSpriteClick: func
  };

  render() {
    if (this.props.type === TYPE_CORE) {
      const [width, height] = [50 * this.props.scale, 52 * this.props.scale];
      return (
        <div style={{
          width: width,
          height: height,
          margin: '3px auto 0'
        }}>
          <img src={loadImages()[this.props.img]} width={width} height={height} />
        </div>
      );
    } else if (this.props.type === TYPE_EVENT) {
      if (this.props.spriteV < 2 && this.props.source !== 'builtin') {
        // Legacy event images.
        const [width, height] = [25 * this.props.scale, 42 * this.props.scale];
        return (
          <div
            onClick={this.props.onSpriteClick}
            style={{
              width: width,
              height: height,
              margin: `${10 * this.props.scale}px auto 0`
          }}>
            <Identicon id={this.props.spriteID} width={width} size={4} />
          </div>
        );
      } else {
        const [width, height] = [140 * this.props.scale - 6, 52 * this.props.scale];
        return (
          <div
            onClick={this.props.onSpriteClick}
            style={{
              width: width,
              height: height
          }}>
            <TriangleArt
              id={this.props.spriteID}
              width={width}
              height={height}
              cellSize={15 * this.props.scale} />
          </div>
        );
      }
    } else {
      return (
        <div
          onClick={this.props.onSpriteClick}
          style={{
            width: 48 * this.props.scale,
            height: 48 * this.props.scale,
            margin: '2px auto 3px'
        }}>
          <Sprite
            id={this.props.spriteID}
            palette={this.props.type === TYPE_ROBOT ? 'nes' : 'greys'}
            size={24}
            scale={this.props.scale}
            output="html" />
        </div>
      );
    }
  }
}
