import * as React from 'react';
import { without } from 'lodash';

import * as w from '../../types';

import { Layout } from './types.enums';
import PageSwitcher from './PageSwitcher';
import CardGrid from './CardGrid';
import CardTable from './CardTable';

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
  onCardClick: (cardId: w.CardId) => void
}

interface CardCollectionState {
  page: number
}

export default class CardCollection extends React.Component<CardCollectionProps, CardCollectionState> {
  public state = {
    page: 1
  };

  get numPages(): number {
    return Math.ceil(this.props.cards.length / 20);
  }

  get currentPage(): number {
    return Math.min(this.state.page, this.numPages);
  }

  get cards(): w.CardInStore[] {
    return this.props.cards.slice((this.currentPage - 1) * 20, this.currentPage * 20);
  }

  public render(): JSX.Element {
    const GridOrTable = this.props.layout === 0 ? CardGrid : CardTable;
    return (
      <div style={{width: '100%'}}>
        {this.renderPageControls()}
        <GridOrTable
          selectable={!this.props.allowMultipleSelection}
          cards={this.cards}
          selectedCardIds={this.props.selectedCardIds}
          onCardClick={this.onCardClick}/>
        {this.renderPageControls()}
      </div>
    );
  }

  private isSelectable(card: w.CardInStore): boolean {
    return !this.props.onlySelectCustomCards || card.source !== 'builtin';
  }

  private onCardClick = (id: w.CardId) => {
    const card = this.cards.find((c) => c.id === id);
    if (card && this.isSelectable(card)) {
      if (this.props.selectedCardIds.includes(id) && !this.props.allowMultipleSelection) {
        this.props.onSelection(without(this.props.selectedCardIds, id));
      } else {
        this.props.onSelection([...this.props.selectedCardIds, id]);
      }
    }
  }

  private handleClickPrevPage = () => this.setState({page: this.currentPage - 1});
  private handleClickNextPage = () => this.setState({page: this.currentPage + 1});

  private renderPageControls = () => (
    <PageSwitcher
      page={this.currentPage}
      maxPages={this.numPages}
      prevPage={this.handleClickPrevPage}
      nextPage={this.handleClickNextPage} />
  )
}
