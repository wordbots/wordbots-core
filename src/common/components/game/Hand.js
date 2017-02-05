import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

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
          status={this.props.status}
          name={card.name}
          type={card.type}
          text={card.text || ''}
          img={card.img}
          cost={card.cost}
          cardStats={card.stats}
          selected={this.props.selectedCard === index}
          visible={this.props.isCurrentPlayer} />
      );
    });

    return (
      <ReactCSSTransitionGroup
        transitionName="hand"
        transitionEnterTimeout={500}
        transitionLeave={false}
        style={{
          display: 'flex',
          justifyContent: 'center'
        }}>
        {cards}
      </ReactCSSTransitionGroup>
    );
  }
}

Hand.propTypes = {
  cards: React.PropTypes.array,
  isCurrentPlayer: React.PropTypes.bool,
  onSelectCard: React.PropTypes.func,
  selectedCard: React.PropTypes.number,
  status: React.PropTypes.object
};

export default Hand;
