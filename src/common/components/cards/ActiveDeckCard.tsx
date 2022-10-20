import { noop, truncate } from 'lodash';
import * as React from 'react';

import * as w from '../../types';
import CardTooltip from '../card/CardTooltip';
import RaritySymbol from '../card/RaritySymbol';

import { CardWithCount } from './types';

interface ActiveDeckCardProps {
  card: CardWithCount
  showCount: boolean
  rarity?: w.CardInSetRarity

  onIncreaseCardCount?: (cardId: w.CardId) => void
  onDecreaseCardCount?: (cardId: w.CardId) => void
  onRemoveCard: (cardId: w.CardId) => void
  onUpdateCardRarities?: (cardRarities: Record<w.CardId, w.CardInSetRarity | undefined>) => void
}

export default class ActiveDeckCard extends React.Component<ActiveDeckCardProps> {
  static styles: Record<string, React.CSSProperties> = {
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
      cursor: 'pointer',
      marginTop: 8,
      marginRight: 5
    },
    raritySymbol: {
      width: 20,
      marginLeft: 3,
      position: 'relative',
      left: 5,
      cursor: 'pointer'
    }
  };

  public render(): JSX.Element {
    const { card, showCount, rarity } = this.props;
    return (
      <div style={{ display: 'flex', justifyContent: 'spaceBetween' }}>
        <span style={ActiveDeckCard.styles.xButton} onClick={this.handleRemoveCard}>
          x
        </span>
        <span style={{ flexGrow: 5 }}>
          <CardTooltip card={card}>
            <div style={ActiveDeckCard.styles.outerCard}>
              <div style={ActiveDeckCard.styles.cardCost}>{card.cost}</div>
              <div style={ActiveDeckCard.styles.cardName}>{truncate(card.name, { length: 20 })}</div>
              {showCount && <div style={ActiveDeckCard.styles.cardCount}>
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
        </span>
        {rarity &&
          <span
            style={ActiveDeckCard.styles.raritySymbol}
            onClick={this.handleToggleRarity}
          >
            <RaritySymbol isEditing rarity={rarity} />
          </span>
        }
      </div>
    );
  }

  private handleDecreaseCardCount = () => { (this.props.onDecreaseCardCount || noop)(this.props.card.id); };
  private handleIncreaseCardCount = () => { (this.props.onIncreaseCardCount || noop)(this.props.card.id); };
  private handleRemoveCard = () => { this.props.onRemoveCard(this.props.card.id); };

  private handleToggleRarity = () => {
    const { card, rarity, onUpdateCardRarities } = this.props;
    if (rarity && onUpdateCardRarities) {
      const newRarity = ({ 'common': 'uncommon', 'uncommon': 'rare', 'rare': 'common' })[rarity] as w.CardInSetRarity;
      onUpdateCardRarities({ [card.id]: newRarity });
    }
  };
}
