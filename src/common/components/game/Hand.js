import React, { Component } from 'react';
import { array, bool, func, number, object, string } from 'prop-types';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import { isEmpty, isNull } from 'lodash';

import { splitSentences } from '../../util/cards';
import { getCost } from '../../util/game';
import Card from '../card/Card';
import Sentence from '../card/Sentence';

export default class Hand extends Component {
  static propTypes = {
    name: string,
    cards: array,
    isActivePlayer: bool,
    onSelectCard: func,
    onHoverCard: func,
    selectedCard: number,
    hoveredCard: number,
    targetableCards: array,
    status: object,
    curved: bool,
    opponent: bool
  };

  calculateAvailableWidth() {
    this.availableWidth = this.node.offsetWidth;
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

          selected={this.props.selectedCard === idx && (isEmpty(this.props.targetableCards) || !this.props.isActivePlayer)}
          targetable={this.props.isActivePlayer && this.props.targetableCards.includes(card.id)}
          visible={this.props.isActivePlayer}

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
      <CSSTransitionGroup
        ref={node => this.node = node}
        id={this.props.opponent ? 'handTop' : 'handBottom'}
        transitionName="hand"
        transitionEnterTimeout={500}
        transitionLeave={false}
        style={{
          display: 'flex',
          justifyContent: 'center',
          width: 'calc(100% - 400px)',
          position: 'absolute',
          left: 0,
          right: 0,
          margin: '0 auto'
        }}>
        {this.renderCards()}
      </CSSTransitionGroup>
    );
  }
}
