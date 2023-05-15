import { without } from 'lodash';
import * as React from 'react';

import * as w from '../../types';

import CardGrid from './CardGrid';
import CardTable from './CardTable';
import PageSwitcher from './PageSwitcher';
import { Layout } from './types.enums';

interface CardCollectionProps {
  cards: w.CardInStore[]
  selectedCardIds: w.CardId[]
  layout: Layout
  allowMultipleSelection?: boolean
  onlySelectCustomCards?: boolean
  onSelection: (cardIds: w.CardId[]) => void
}

export interface CardGridOrTableProps {
  cards: w.CardInStore[]
  selectedCardIds: string[]
  selectable: boolean
  onCardClick: (cardId: w.CardId) => void
}

interface CardCollectionState {
  page: number
}

export default class CardCollection extends React.Component<CardCollectionProps, CardCollectionState> {
  public state = {
    page: 1
  };

  get numPages(): number {
    return Math.ceil(this.props.cards.length / 24);
  }

  get currentPage(): number {
    return Math.min(this.state.page, this.numPages);
  }

  get cards(): w.CardInStore[] {
    return this.props.cards.slice((this.currentPage - 1) * 24, this.currentPage * 24);
  }

  public render(): JSX.Element {
    const GridOrTable = this.props.layout === 0 ? CardGrid : CardTable;
    return (
      <div style={{ width: '100%' }}>
        {this.renderPageControls()}
        <GridOrTable
          selectable
          cards={this.cards}
          selectedCardIds={this.props.selectedCardIds}
          onCardClick={this.onCardClick}
        />
        {this.renderPageControls()}
      </div>
    );
  }

  private isSelectable(card: w.CardInStore): boolean {
    return !this.props.onlySelectCustomCards || card.metadata.source.type === 'user';
  }

  private onCardClick = (id: w.CardId) => {
    const { selectedCardIds, allowMultipleSelection, onSelection } = this.props;
    const card = this.cards.find((c) => c.id === id);
    if (card && this.isSelectable(card)) {
      if (selectedCardIds.includes(id) && !allowMultipleSelection) {
        onSelection(without(selectedCardIds, id));
      } else {
        onSelection([...selectedCardIds, id]);
      }
    }
  }

  private handleClickPrevPage = () => this.setState({ page: this.currentPage - 1 });
  private handleClickNextPage = () => this.setState({ page: this.currentPage + 1 });

  private renderPageControls = () => (
    <PageSwitcher
      page={this.currentPage}
      maxPages={this.numPages}
      prevPage={this.handleClickPrevPage}
      nextPage={this.handleClickNextPage}
    />
  )
}
