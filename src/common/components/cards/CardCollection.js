import React, { Component } from 'react';
import { array, func, number } from 'prop-types';
import { without } from 'lodash';

import PageSwitcher from './PageSwitcher';
import CardGrid from './CardGrid';
import CardTable from './CardTable';

export default class CardCollection extends Component {
  static propTypes = {
    cards: array,
    selectedCardIds: array,
    layout: number,

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

  renderCardCollection() {
    if (this.props.layout === 0) {
      return (
        <CardGrid
          cards={this.cards}
          selectedCardIds={this.props.selectedCardIds}
          onCardClick={id => {
            const card = this.cards.find(c => c.id === id);
            if (card.source !== 'builtin') {
              if (this.props.selectedCardIds.includes(id)) {
                this.props.onSelection(without(this.props.selectedCardIds, id));
              } else {
                this.props.onSelection([...this.props.selectedCardIds, id]);
              }
            }
          }} />
      );
    } else {
      return (
        <CardTable
          cards={this.cards}
          selectedCardIds={this.props.selectedCardIds}
          onSelection={selectedRows => this.props.onSelection(selectedRows)}/>
      );
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

  render() {
    return (
      <div style={{width: '100%'}}>
        {this.renderPageControls()}
        {this.renderCardCollection()}
        {this.renderPageControls()}
      </div>
    );
  }
}
