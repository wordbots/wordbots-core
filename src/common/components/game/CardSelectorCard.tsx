import * as React from 'react';

import * as w from '../../types';

interface CardSelectorCardProps {
  card: w.CardInStore
  isSelected: boolean
  onCardSelect: (card: w.CardInStore) => void
}

export default class CardSelectorCard extends React.Component<CardSelectorCardProps> {
  public render(): JSX.Element {
    const { card, isSelected } = this.props;
    const color = card.metadata.source.type === 'builtin' ? '#666' : 'black';
    const backgroundColor = isSelected ? '#BBB' : 'white';

    return (
      <div
        onClick={this.onCardSelect}
        style={{
          display: 'flex',
          borderBottom: '2px solid black',
          borderRight: '2px solid black',
          borderLeft: '2px solid black',
          cursor: 'pointer',
          height: 30,
          alignItems: 'center',
          backgroundColor
        }}
      >
        <div
          style={{
            backgroundColor: 'rgb(0, 188, 212)',
            color: 'white',
            borderRight: '2px solid black',
            fontFamily: '"Carter One", "Carter One-fallback"',
            width: 30,
            height: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {card.cost}
        </div>
        <div
          style={{
            width: 'calc(100% - 30px)',
            paddingLeft: 5,
            color
          }}
        >
          {card.name}
        </div>
      </div>
    );
  }

  private onCardSelect = () => {
    this.props.onCardSelect(this.props.card);
  }
}
