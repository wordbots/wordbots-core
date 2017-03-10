import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import { getCost } from '../../util';

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
      const cardClick = this.onCardClick.bind(this, index);

      return (
        <Card
          onCardClick={cardClick}
          key={card.id}
          status={this.props.status}
          name={card.name}
          spriteID={card.spriteID}
          type={card.type}
          text={card.text || ''}
          img={card.img}
          cost={getCost(card)}
          baseCost={card.baseCost}
          cardStats={card.stats}
          stats={{}}
          scale={1}
          selected={this.props.selectedCard === index && _.isEmpty(this.props.targetableCards)}
          targetable={this.props.targetableCards.includes(card.id)}
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
  status: React.PropTypes.object,
  targetableCards: React.PropTypes.array
};

export default Hand;
