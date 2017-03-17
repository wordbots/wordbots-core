import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import ReactDOM from 'react-dom';
import { isEmpty, isNull } from 'lodash';

import { splitSentences, getCost } from '../../util';
import Sentence from '../cards/Sentence';

import Card from './Card';


class Hand extends Component {
  constructor(props) {
    super(props);
  }

  calculateAvailableWidth() {
    this.availableWidth = ReactDOM.findDOMNode(this).offsetWidth;
  }

  componentDidMount() {
    this.calculateAvailableWidth();
  }

  componentWillUpdate() {
    this.calculateAvailableWidth();
  }

  renderCards() {
    const widthPerCard = 151;
    const defaultMargin = 24;
    const maxWidth = this.availableWidth - 20;
    const numCards = this.props.cards.length;
    const baseWidth = numCards * widthPerCard;
    const cardMargin = maxWidth ? Math.min((maxWidth - baseWidth) / (numCards - 1), defaultMargin) : defaultMargin;
    const adjustedWidth = numCards * (widthPerCard + cardMargin) - cardMargin;

    return this.props.cards.map((card, idx) => {
      const zIndex = isNull(this.props.hoveredCard) ? 0 : (1000 - Math.abs(this.props.hoveredCard - idx) * 10);

      // TODO this isn't quite right ...
      const rotationDegs = (idx - (numCards - 1)/2) * 5;
      const translationPx = Math.sin(Math.abs(rotationDegs) * Math.PI / 180) * adjustedWidth / 5;

      return (
        <Card
          key={card.id}
          numCards={numCards}
          status={this.props.status}
          name={card.name}
          spriteID={card.spriteID}
          type={card.type}
          text={splitSentences(card.text).map(Sentence)}
          rawText={card.text || ''}
          img={card.img}
          cost={getCost(card)}
          baseCost={card.baseCost}
          cardStats={card.stats}
          source={card.source}
          stats={{}}

          selected={this.props.selectedCard === idx && isEmpty(this.props.targetableCards)}
          targetable={this.props.targetableCards.includes(card.id)}
          visible={this.props.isCurrentPlayer}

          scale={1}
          margin={idx < numCards - 1 ? cardMargin : 0}
          rotation={this.props.curved ? rotationDegs : 0}
          yTranslation={this.props.curved ? translationPx : 0}
          zIndex={zIndex}

          onCardClick={e => { this.props.onSelectCard(idx); }}
          onCardHover={overOrOut => { this.props.onHoverCard(overOrOut ? idx : null); }} />
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

const { array, bool, func, number, object, string } = React.PropTypes;

Hand.propTypes = {
  name: string,
  cards: array,
  isCurrentPlayer: bool,
  onSelectCard: func,
  onHoverCard: func,
  selectedCard: number,
  hoveredCard: number,
  targetableCards: array,
  status: object,
  curved: bool
};

export default Hand;
