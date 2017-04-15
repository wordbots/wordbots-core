import React, { Component } from 'react';
import { array, func, number, string } from 'prop-types';

import Card from '../game/Card';

import Sentence from './Sentence';

export default class CardPreview extends Component {
  static propTypes = {
    name: string,
    spriteID: string,
    type: number,
    sentences: array,
    attack: number,
    speed: number,
    health: number,
    energy: number,

    onSpriteClick: func
  };

  render() {
    const stats = {
      attack: this.props.attack,
      speed: this.props.speed,
      health: this.props.health
    };

    return (
      <div style={{width: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 64}}>
        <Card
          name={this.props.name || '[Unnamed]'}
          spriteID={this.props.spriteID}
          type={this.props.type}
          img={'char'}
          cost={this.props.energy}
          stats={stats}
          cardStats={stats}
          text={this.props.sentences.map(s => Sentence(s.sentence, s.result))}
          rawText={this.props.sentences.map(s => s.sentence).join('. ')}
          parseResults={this.props.sentences.map(s => JSON.stringify(s.result))}
          scale={3}
          onSpriteClick={this.props.onSpriteClick} />
      </div>
    );
  }
}
