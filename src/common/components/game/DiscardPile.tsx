import * as React from 'react';

import * as w from '../../types';
import Card from '../card/Card';

interface DiscardPileProps {
  cards: w.PossiblyObfuscatedCard[]
}

export default class DiscardPile extends React.Component<DiscardPileProps> {
  public render(): JSX.Element {
    const cards = this.props.cards;

    return (
      <div
        style={{
          display: 'flex'
        }}
      >
        {cards.length > 0 ? this.renderCards(cards) : ''}
      </div>
    );
  }

  private renderCards(cards: w.PossiblyObfuscatedCard[]): JSX.Element[] {
    return cards.map((card, index) =>
      (
        <div
          style={{
            display: 'inline-block',
            marginRight: 20
          }}
          key={index}
        >
          {Card.fromObj(card)}
        </div>
      )
    );
  }
}
