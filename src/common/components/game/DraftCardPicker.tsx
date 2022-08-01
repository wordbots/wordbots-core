import { without } from 'lodash';
import * as React from 'react';

import * as w from '../../types';
import { Card } from '../card/Card';

interface DraftCardPickerProps {
  cardGroup: w.CardInGame[]
  player: w.PlayerColor
  onDraftCards: (player: w.PlayerColor, cards: w.CardInGame[]) => void
}

interface DraftCardPickerState {
  selectedCardIds: w.CardId[]
}

export default class DraftCardPicker extends React.Component<DraftCardPickerProps, DraftCardPickerState> {
  public state: DraftCardPickerState = {
    selectedCardIds: []
  };

  public render(): JSX.Element {
    const { cardGroup } = this.props;
    const { selectedCardIds } = this.state;

    return (
      <div>
        <div style={{
          fontFamily: '"Carter One", "Carter One-fallback"',
          color: 'white',
          textAlign: 'center'
        }}>
          Choose two cards.
        </div>
        <div style={{
          minHeight: '100%',
          margin: '0 auto',
          display: 'flex',
          flexFlow: 'row wrap',
        }}>
          {cardGroup.map((card, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                flexBasis: 'calc(50% - 40px)',
                justifyContent: 'center',
                flexDirection: 'column',
                margin: '0 auto',
              }}
            >
              {Card.fromObj(card, {
                selected: selectedCardIds.includes(card.id),
                onCardClick: () => this.handleSelectCard(card)
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  private handleSelectCard(card: w.CardInGame): void {
    const { cardGroup, player, onDraftCards } = this.props;
    const { selectedCardIds } = this.state;

    const { id } = card;
    const newSelectedCardIds = selectedCardIds.includes(id) ? without(selectedCardIds, id) : [...selectedCardIds, id];

    if (newSelectedCardIds.length === 2) {
      onDraftCards(player, cardGroup.filter((c) => newSelectedCardIds.includes(c.id)));
      this.setState({ selectedCardIds: [] });
    } else {
      this.setState({ selectedCardIds: newSelectedCardIds });
    }
  }
}
