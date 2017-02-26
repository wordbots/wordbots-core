import React, { Component } from 'react';

import Card from '../game/Card';

class CardPreview extends Component {
  renderSentence(s) {
    if (/\S/.test(s.sentence)) {
      const color = s.result.js ? 'green' : (s.result.error ? 'red' : 'black');
      return (
        <span style={{color: color}}>
          {s.sentence}.
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
          type={this.props.type}
          img={'char'}
          cost={1}
          stats={{
            attack: 1,
            speed: 1,
            health: 1
          }}
          cardStats={{
            attack: 1,
            speed: 1,
            health: 1
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
  type: React.PropTypes.number,
  sentences: React.PropTypes.array
};

export default CardPreview;
