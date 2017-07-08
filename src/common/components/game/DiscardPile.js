import React, { Component } from 'react';
import { array } from 'prop-types';

import { splitSentences } from '../../util/cards';
import Sentence from '../card/Sentence';
import Card from '../card/Card';

class DiscardPile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentTopCard: null
    };
  }

  renderCard(card) {
    return (
      <Card
        id={card.id}
        name={card.name}
        spriteID={card.spriteID}
        spriteV={card.spriteV}
        type={card.type}
        text={splitSentences(card.text).map(Sentence)}
        rawText={card.text || ''}
        stats={card.stats}
        cardStats={card.stats}
        cost={card.cost}
        baseCost={card.cost}
        source={card.source} />
    );
  }

  renderCards(cards) {
    const renderedCards = cards.map((card, index) => 
      <div 
        style={{
          display: 'inline-block',
          marginRight: 20
        }}
        key={index}>
        {this.renderCard(card)}
      </div>
    );

    return renderedCards;
  }

  render() {
    const cards = this.props.cards;

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center'
      }}>
        {cards.length > 0 ? this.renderCards(cards) : ''}
      </div>
    );
  }
}

DiscardPile.propTypes = {
  cards: array
};

export default DiscardPile;
