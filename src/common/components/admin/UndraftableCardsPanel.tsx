import { Button, Toolbar } from '@material-ui/core';
import { difference } from 'lodash';
import * as React from 'react';

import * as w from '../../types';
import { setCardMetadataFlag } from '../../util/firebase';
import CardCollection from '../cards/CardCollection';
import SearchControls from '../cards/SearchControls';
import { Layout, SortCriteria, SortOrder } from '../cards/types.enums';
import { getDisplayedCards } from '../cards/utils';

interface UndraftableCardsPanelProps {
  cards: w.CardInStore[]
  reloadData: () => void
}

interface UndraftableCardsPanelState {
  privateCardIds: w.CardId[]
  selectedCardIds: w.CardId[]
  changesMade: boolean
  searchText: string
}

class UndraftableCardsPanel extends React.PureComponent<UndraftableCardsPanelProps, UndraftableCardsPanelState> {
  public constructor(props: UndraftableCardsPanelProps) {
    super(props);
    this.state = {
      privateCardIds: props.cards.filter((c) => c.metadata?.isPrivate).map((c) => c.id),
      selectedCardIds: props.cards.filter((c) => c.metadata?.disallowInEverythingDraft).map((c) => c.id),
      changesMade: false,
      searchText: ''
    };
  }

  public render(): JSX.Element {
    const { cards } = this.props;
    const { privateCardIds, selectedCardIds, changesMade, searchText } = this.state;

    const displayedCards: w.CardInStore[] = getDisplayedCards(
      cards.map((c) => ({ ...c, text: c.metadata?.isPrivate ? `[PRIVATE] ${c.text}` : c.text })),
      {
        sortCriteria: SortCriteria.Timestamp,
        sortOrder: SortOrder.Ascending,
        filters: { robots: true, structures: true, events: true },
        costRange: [0, 20],
        searchText
      }
    );

    return (
      <div>
        <Toolbar style={{ justifyContent: 'space-between' }}>
          <Button variant="contained" disabled={!changesMade} onClick={this.handleCommitToFirebase}>
            Commit to Firebase
            </Button>
          <span>{selectedCardIds.length} cards selected (+ {privateCardIds.length} private cards)</span>
          <SearchControls compact onChange={this.handleSetSearchText} />
        </Toolbar>

        <CardCollection
          layout={Layout.Table}
          cards={displayedCards}
          selectedCardIds={[...selectedCardIds, ...privateCardIds]}
          onSelection={this.handleSetSelectedCardIds}
        />
      </div>
    );
  }

  private handleSetSelectedCardIds = (selectedCardIds: w.CardId[]): void => {
    this.setState((state) => ({
      changesMade: true,
      selectedCardIds: difference(selectedCardIds, state.privateCardIds)
    }));
  }

  private handleSetSearchText = (searchText: string): void => {
    this.setState({
      searchText
    });
  }

  private handleCommitToFirebase = (): void => {
    const { cards, reloadData } = this.props;
    const { selectedCardIds } = this.state;

    cards.forEach((card) => {
      setCardMetadataFlag(card.id, 'disallowInEverythingDraft', selectedCardIds.includes(card.id) ? true : undefined);
    });
    reloadData();
    this.setState({
      searchText: ''
    });
  }
}

export default UndraftableCardsPanel;
