import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group' 
import Card from './Card';

class Hand extends Component {
  constructor(props) {
    super(props);
  }

  onCardClick(index, e) {
    this.props.onSelectCard(index);
  }

  render() {
    const cards = this.props.cards.map((card, index) => {
      let cardClick = this.onCardClick.bind(this, index);

      return (
        <Card
          onCardClick={cardClick}
          key={index}
          cardStats={card}
          selected={this.props.selectedCard === index}
          visible={this.props.isCurrentPlayer} />
      )
    });

    return (
      <ReactCSSTransitionGroup
        transitionName="example"
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
        style={{
          display: 'flex',
          justifyContent: 'center'
        }}>
        {cards}
      </ReactCSSTransitionGroup>
    )
  }
}

Hand.propTypes = {
  cards: React.PropTypes.array,
  isCurrentPlayer: React.PropTypes.bool,
  onSelectCard: React.PropTypes.func,
  selectedCard: React.PropTypes.number
}

export default Hand;
