import React, { Component } from 'react';

import Card from '../game/Card';

class CardPreview extends Component {
  renderSentence(s) {
    if (/\S/.test(s.sentence)) {
      const color = s.result.js ? 'green' : (s.result.error ? 'red' : 'black');
      return (
        <span style={{color: color}}>
          {s.sentence.split(' ').map(word => {
            if ((s.result.unrecognizedTokens || []).includes(word.toLowerCase())) {
              return (
                <span>
                  {' '}<u>{word}</u>
                </span>
              );
            } else {
              return (
                <span>
                  {' '}{word}
                </span>
              );
            }
          })}.
        </span>
      );
    } else {
      return null;
    }
  }

  render() {
    return (
      <div style={{width: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 64}}>
        <Card
          name={this.props.name}
          spriteID={this.props.spriteID}
          onSpriteClick={this.props.onSpriteClick}
          type={this.props.type}
          img={'char'}
          cost={this.props.energy}
          stats={{
            attack: this.props.attack,
            speed: this.props.speed,
            health: this.props.health
          }}
          cardStats={{
            attack: this.props.attack,
            speed: this.props.speed,
            health: this.props.health
          }}
          text={this.props.sentences.map(this.renderSentence)}
          visible
          scale={3} />
      </div>
    );
  }
}

CardPreview.propTypes = {
  name: React.PropTypes.string,
  spriteID: React.PropTypes.string,
  type: React.PropTypes.number,
  sentences: React.PropTypes.array,
  attack: React.PropTypes.number,
  speed: React.PropTypes.number,
  health: React.PropTypes.number,
  energy: React.PropTypes.number,

  onSpriteClick: React.PropTypes.func
};

export default CardPreview;
