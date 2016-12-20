import React, { Component } from 'react';
import Card from './Card'

class Hand extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedCard: null
    }
  }

  render() {
    let self = this;

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center'
      }}>
        {this.props.cards.map(function (card, index) {
          return <Card key={index} cardStats={card} opponent={self.props.opponent}/>
        })}
      </div>
    )
  }
}

Hand.propTypes = {
  cards: React.PropTypes.array
}

export default Hand;
