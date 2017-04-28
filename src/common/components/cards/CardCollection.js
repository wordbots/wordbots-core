import React, { Component } from 'react';
import { array, bool, func, number } from 'prop-types';
import { without } from 'lodash';

import PageSwitcher from './PageSwitcher';
import CardGrid from './CardGrid';
import CardTable from './CardTable';

export default class CardCollection extends Component {
  static propTypes = {
    cards: array,
    selectedCardIds: array,
    layout: number,
    allowMultipleSelection: bool,
    onlySelectCustomCards: bool,

    onSelection: func
  };

  constructor(props) {
    super(props);

    this.state = {
      page: 1
    };
  }

  get numPages() {
    return Math.ceil(this.props.cards.length / 20);
  }

  get currentPage() {
    return Math.min(this.state.page, this.numPages);
  }

  get cards() {
    return this.props.cards.slice((this.currentPage - 1) * 20, this.currentPage * 20);
  }

  isSelectable(card) {
    return !this.props.onlySelectCustomCards || card.source !== 'builtin';
  }

  onCardClick = (id) => {
    const card = this.cards.find(c => c.id === id);
    if (this.isSelectable(card)) {
      if (this.props.selectedCardIds.includes(id) && !this.props.allowMultipleSelection) {
        this.props.onSelection(without(this.props.selectedCardIds, id));
      } else {
        this.props.onSelection([...this.props.selectedCardIds, id]);
      }
    }
  }

  renderPageControls() {
    return (
      <PageSwitcher
          page={this.currentPage}
          maxPages={this.numPages}
          prevPage={() => this.setState({page: this.currentPage - 1})}
          nextPage={() => this.setState({page: this.currentPage + 1})}/>
    );
  }

  renderGrid() {
    return (
     <CardGrid
        selectable={!this.props.allowMultipleSelection}
        cards={this.cards}
        selectedCardIds={this.props.selectedCardIds}
        onCardClick={this.onCardClick} />
    );
  }

  renderTable() {
    return (
      <CardTable
        selectable={!this.props.allowMultipleSelection}
        cards={this.cards}
        selectedCardIds={this.props.selectedCardIds}
        onCardClick={this.onCardClick}/>
    );
  }

  render() {
    return (
      <div style={{width: '100%'}}>
        {this.renderPageControls()}
        {this.props.layout === 0 ? this.renderGrid() : this.renderTable()}
        {this.renderPageControls()}
      </div>
    );
  }
}
