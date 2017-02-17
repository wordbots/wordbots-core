import React, { Component } from 'react';

import Card from '../game/Card';

class CardPreview extends Component {
  render() {
    return (
      <div style={{width: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <Card 
          name={'Test'}
          type={0}
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
          text={'test'}
          visible
          scale={3} />
      </div>
    );
  }
}

export default CardPreview;