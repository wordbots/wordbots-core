import { without } from 'lodash';
import * as React from 'react';

import * as w from '../../types';
import { Card } from '../card/Card';

interface DraftAreaProps {
  player: w.PlayerColor | 'neither'
  usernames: w.PerPlayer<string>
  draft: w.DraftState
  onForfeit: (winner: w.PlayerColor) => void
  onDraftCards: (player: w.PlayerColor, cards: w.CardInGame[]) => void
}

interface DraftAreaState {
  selectedCardIds: w.CardId[]
}

export default class DraftArea extends React.Component<DraftAreaProps, DraftAreaState> {
  public state: DraftAreaState = {
    selectedCardIds: []
  };

  get currentCardGroup(): w.CardInGame[] | null {
    const { draft, player } = this.props;
    if (player !== 'neither') {
      return draft[player].cardGroupsToShow[0] || null;
    } else {
      return null;
    }
  }

  public render(): JSX.Element {
    const { selectedCardIds } = this.state;

    // TODO what to render when player is 'neither' (e.g. spectator)?
    return (
      <div style={{
        width: 500,
        minHeight: '100%',
        margin: '0 auto',
        display: 'flex',
        flexFlow: 'row wrap',
      }}>
        {this.currentCardGroup?.map((card, i) => (
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
    );
  }

  private handleSelectCard(card: w.CardInGame): void {
    const { player, onDraftCards } = this.props;
    const { selectedCardIds } = this.state;

    if (player !== 'neither') {
      const { id } = card;
      const newSelectedCardIds = selectedCardIds.includes(id) ? without(selectedCardIds, id) : [...selectedCardIds, id];

      if (newSelectedCardIds.length === 2) {
        onDraftCards(player, this.currentCardGroup!.filter((c) => newSelectedCardIds.includes(c.id)));
        this.setState({ selectedCardIds: [] });
      } else {
        this.setState({ selectedCardIds: newSelectedCardIds });
      }
    }
  }
}
