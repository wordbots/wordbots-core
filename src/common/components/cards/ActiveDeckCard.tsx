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
      fontFamily: '"Carter One", "Carter One-fallback"',
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
      width: 55,
      marginRight: 4,
      display: 'flex',
      alignItems: 'center',
      placeContent: 'space-between',
      fontSize: '0.9em'
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
      <div>
        <span style={this.styles.xButton} onClick={this.handleRemoveCard}>
          x
        </span>
        <CardTooltip card={card}>
          <div style={this.styles.outerCard}>
            <div style={this.styles.cardCost}>{card.cost}</div>
            <div style={this.styles.cardName}>{truncate(card.name, { length: 20 })}</div>
            {showCount && <div style={this.styles.cardCount}>
              <span onClick={this.handleDecreaseCardCount}>
                &ndash;
              </span>
              <b>{card.count}</b>
              <span onClick={this.handleIncreaseCardCount}>
                +
              </span>
            </div>}
          </div>
        </CardTooltip>
      </div>
    );
  }

  private handleDecreaseCardCount = () => { (this.props.onDecreaseCardCount || noop)(this.props.card.id); };
  private handleIncreaseCardCount = () => { (this.props.onIncreaseCardCount || noop)(this.props.card.id); };
  private handleRemoveCard = () => { this.props.onRemoveCard(this.props.card.id); };
}
