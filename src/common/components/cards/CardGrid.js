import React, { Component } from 'react';

import { splitSentences } from '../../util/cards';
import Card from '../game/Card';

import Sentence from './Sentence';

class CardGrid extends Component {
  sortCards(a, b) {
    const func = this.props.sortFunc;

    if (func(a) < func(b)) {
      return this.props.sortOrder ? 1 : -1;
    } else if (func(a) > func(b)) {
      return this.props.sortOrder ? -1 : 1;
    } else {
      return 0;
    }
  }

  renderCard(card) {
    return (
      <div
        key={card.id}
        style={{
          marginRight: 15
      }}>
        <Card
          visible
          collection
          name={card.name}
          spriteID={card.spriteID}
          type={card.type}
          text={splitSentences(card.text).map(Sentence)}
          rawText={card.text || ''}
          stats={card.stats}
          cardStats={card.stats}
          cost={card.cost}
          baseCost={card.cost}
          source={card.source}
          scale={1}
          selected={(this.props.selectedCardIds || []).includes(card.id)}
          onCardClick={() => this.props.onCardClick(card)}
          onCardHover={() => {}} />
      </div>
    );
  }

  render() {
    return (
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        width: '100%',
        margin: 10
      }}>
        {this.props.children}
        {this.props.cards
          .filter(this.props.filterFunc)
          .sort(this.sortCards.bind(this))
          .map(this.renderCard.bind(this))}
      </div>
    );
  }
}

const { array, element, func, number } = React.PropTypes;

CardGrid.propTypes = {
  children: element,
  cards: array,
  selectedCardIds: array,
  filterFunc: func,
  sortFunc: func,
  sortOrder: number,

  onCardClick: func
};

export default CardGrid;

