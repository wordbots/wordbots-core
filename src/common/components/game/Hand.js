import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import { getCost } from '../../util';

import Card from './Card';


class Hand extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
   this.availableWidth = React.findDOMNode(this).offsetWidth;
  }

  onCardClick(index, e) {
    this.props.onSelectCard(index);
  }

  onCardHover(index, e) {
    this.props.onHoverCard(index);
  }

  render() {
    const widthPerCard = 150;
    const numCards = this.props.cards.length;
    const baseWidth = numCards * widthPerCard;
    const cardMargin = (this.availableWidth && this.availableWidth < baseWidth) ? (this.availableWidth - baseWidth) / numCards : 0;

    const cards = this.props.cards.map((card, index) => {
      const cardClick = this.onCardClick.bind(this, index);
      const cardHover = this.onCardHover.bind(this, index);

      return (
        <Card
          onCardClick={cardClick}
          onCardHover={cardHover}
          key={card.id}
          status={this.props.status}
          name={card.name}
          type={card.type}
          text={card.text || ''}
          img={card.img}
          cost={getCost(card)}
          baseCost={card.baseCost}
          cardStats={card.stats}
          stats={{}}
          scale={1}
          cardMargin={cardMargin}
          selected={this.props.selectedCard === index && _.isEmpty(this.props.targetableCards)}
          hovered={this.props.hoveredCard === index}
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
          justifyContent: 'center',
          width: '100%'
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
  onHoverCard: React.PropTypes.func,
  selectedCard: React.PropTypes.number,
  hoveredCard: React.PropTypes.number,
  targetableCards: React.PropTypes.array,
  status: React.PropTypes.object
};

export default Hand;
