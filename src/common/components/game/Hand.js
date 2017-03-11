import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import ReactDOM from 'react-dom';
import { isEmpty, isNull } from 'lodash';

import { getCost } from '../../util';

import Card from './Card';


class Hand extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.availableWidth = ReactDOM.findDOMNode(this).offsetWidth;
  }

  renderCards() {
    const widthPerCard = 151;
    const defaultMargin = 24;
    const maxWidth = this.availableWidth - 10;
    const numCards = this.props.cards.length;
    const baseWidth = numCards * widthPerCard;
    const cardMargin = maxWidth ? Math.min((maxWidth - baseWidth) / (numCards - 1), defaultMargin) : defaultMargin;
    const adjustedWidth = numCards * (widthPerCard + cardMargin) - cardMargin;

    return this.props.cards.map((card, idx) => {
      const playerHandDirection = {'orange': 1, 'blue': -1}[this.props.name];

      const zIndex = isNull(this.props.hoveredCard) ? 0 : (1000 - Math.abs(this.props.hoveredCard - idx) * 10);
      const rotationDegs = (idx - (numCards - 1)/2) * 5;
      const translationPx = Math.sin(Math.abs(rotationDegs) * Math.PI / 180) * adjustedWidth / 5;  // TODO this isn't quite right.

      return (
        <Card
          key={card.id}
          numCards={numCards}
          status={this.props.status}
          name={card.name}
          type={card.type}
          text={card.text || ''}
          img={card.img}
          cost={getCost(card)}
          baseCost={card.baseCost}
          cardStats={card.stats}
          stats={{}}

          selected={this.props.selectedCard === idx && isEmpty(this.props.targetableCards)}
          targetable={this.props.targetableCards.includes(card.id)}
          visible={this.props.isCurrentPlayer}

          scale={1}
          margin={idx < numCards - 1 ? cardMargin : 0}
          rotation={rotationDegs * playerHandDirection}
          yTranslation={translationPx * playerHandDirection}
          zIndex={zIndex}

          onCardClick={e => { this.props.onSelectCard(idx); }}
          onCardHover={e => { this.props.onHoverCard(idx); }} />
      );
    });
  }

  render() {
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
        {this.renderCards()}
      </ReactCSSTransitionGroup>
    );
  }
}

Hand.propTypes = {
  name: React.PropTypes.string,
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
