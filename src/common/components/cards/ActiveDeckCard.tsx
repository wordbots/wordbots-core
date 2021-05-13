import { noop, truncate } from 'lodash';
import * as React from 'react';

import * as w from '../../types';
import CardTooltip from '../card/CardTooltip';

import { CardWithCount } from './types';

interface ActiveDeckCardProps {
  card: CardWithCount
  showCount: boolean
  onIncreaseCardCount?: (cardId: w.CardId) => void
  onDecreaseCardCount?: (cardId: w.CardId) => void
  onRemoveCard: (cardId: w.CardId) => void
}

export default class ActiveDeckCard extends React.Component<ActiveDeckCardProps> {
  private styles: Record<string, React.CSSProperties> = {
    outerCard: {
      display: 'flex',
      alignItems: 'stretch',
      cursor: 'pointer',
      height: 30,
      marginBottom: -2,
      borderRadius: 5,
      border: '2px solid #444',
      userSelect: 'none'
    },
    cardCost: {
      width: 30,
      color: 'white',
      fontFamily: 'Carter One',
      backgroundColor: '#00bcd4',
      justifyContent: 'center',
      display: 'flex',
      alignItems: 'center',
      borderTopLeftRadius: 4,
      borderBottomLeftRadius: 4,
      borderRight: '2px solid #444'
    },
    cardName: {
      width: 'calc(100% - 30px)',
      marginLeft: 5,
      display: 'flex',
      alignItems: 'center',
      fontSize: '0.8em'
    },
    cardCount: {
      width: 65,
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    xButton: {
      position: 'absolute',
      cursor: 'pointer',
      left: -12,
      top: 8
    }
  };

  public render(): JSX.Element {
    const { card, showCount } = this.props;
    return (
      <CardTooltip card={card}>
        <span style={this.styles.xButton} onClick={this.handleRemoveCard}>
          x
        </span>
        <div style={this.styles.outerCard}>
          <div style={this.styles.cardCost}>{card.cost}</div>
          <div style={this.styles.cardName}>{truncate(card.name, { length: 20 })}</div>
          {showCount && <div style={this.styles.cardCount}>
            <span onClick={this.handleDecreaseCardCount}>
              &nbsp;&ndash;&nbsp;
            </span>
            {card.count}
            <span onClick={this.handleIncreaseCardCount}>
              &nbsp;+&nbsp;
            </span>
          </div>}
        </div>
      </CardTooltip>
    );
  }

  private handleDecreaseCardCount = () => { (this.props.onDecreaseCardCount || noop)(this.props.card.id); };
  private handleIncreaseCardCount = () => { (this.props.onIncreaseCardCount || noop)(this.props.card.id); };
  private handleRemoveCard = () => { this.props.onRemoveCard(this.props.card.id); };
}
