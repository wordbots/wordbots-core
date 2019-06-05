import * as React from 'react';

import * as w from '../../types';
import Card from '../card/Card';

interface DiscardPileProps {
  cards: w.PossiblyObfuscatedCard[]
  targetableCards: w.CardId[]
  onSelectCard: (id: w.CardId) => void
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
        {cards.length > 0 ? this.renderCards() : ''}
      </div>
    );
  }

  private renderCards(): JSX.Element[] {
    const { cards, targetableCards, onSelectCard } = this.props;
    return cards.map((card, index) =>
      (
        <div
          style={{
            display: 'inline-block',
            marginRight: 20
          }}
          key={index}
        >
          {
            Card.fromObj(card, {
              targetable: targetableCards.includes(card.id),
              onCardClick: onSelectCard
            })
          }
        </div>
      )
    );
  }
}
