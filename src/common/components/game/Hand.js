import React, { Component } from 'react';
import Card from './Card';

class Hand extends Component {
  constructor(props) {
    super(props);
  }

  onCardClick(index, e) {
    this.props.onSelectCard(index);
  }

  render() {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center'
      }}>
        {this.props.cards.map((card, index) => {
          let cardClick = this.onCardClick.bind(this, index);

          return (
            <Card 
              onCardClick={cardClick}
              key={index}
              cardStats={card}
              opponent={this.props.opponent} />
          )
        })}
      </div>
    )
  }
}

Hand.propTypes = {
  cards: React.PropTypes.array,
  opponent: React.PropTypes.bool,
  onSelectCard: React.PropTypes.func
}

export default Hand;
