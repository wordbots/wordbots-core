import React, { Component } from 'react';
import { array } from 'prop-types';

import Card from '../card/Card';

export default class DiscardPile extends Component {
  static propTypes = {
    cards: array
  };

  renderCards(cards) {
    return cards.map((card, index) =>
      <div
        style={{
          display: 'inline-block',
          marginRight: 20
        }}
        key={index}>
        {Card.fromObj(card)}
      </div>
    );
  }

  render() {
    const cards = this.props.cards;

    return (
      <div style={{
        display: 'flex'
      }}>
        {cards.length > 0 ? this.renderCards(cards) : ''}
      </div>
    );
  }
}
