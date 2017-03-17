import React, { Component } from 'react';

import Card from '../game/Card';

import Sentence from './Sentence';

class CardPreview extends Component {
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
          visible
          type={this.props.type}
          img={'char'}
          cost={this.props.energy}
          stats={stats}
          cardStats={stats}
          text={this.props.sentences.map(s => Sentence(s.sentence, s.result))}
          // text={this.props.sentences.map(s => <Sentence text={s.sentence} result={s.result} />)}
          rawText={this.props.sentences.map(s => s.sentence).join('. ')}
          scale={3}

          onCardHover={() => {}}
          onSpriteClick={this.props.onSpriteClick} />
      </div>
    );
  }
}

const { array, func, number, string } = React.PropTypes;

CardPreview.propTypes = {
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

export default CardPreview;
