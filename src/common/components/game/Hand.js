import React, { Component } from 'react';
import Card from './Card'

class Hand extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedCard: null,
      cards: []
    }
  }

  render() {
    let self = this;

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center'
      }}>
        {this.props.cards.map(function(card) {
          return <Card cardStats={card} opponent={self.props.opponent}/>
        })}
      </div>
    )
  }
}

export default Hand;
