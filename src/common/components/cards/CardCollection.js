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

  renderCardCollection(cards) {
    if (this.props.layout === 0) {
      return (
        <CardGrid
          cards={cards}
          selectedCardIds={this.props.selectedCardIds}
          onCardClick={id => {
            const card = this.props.cards.find(c => c.id === id);
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
          cards={cards}
          selectedCardIds={this.props.selectedCardIds}
          onSelection={selectedRows => this.props.onSelection(selectedRows)}/>
      );
    }
  } 

  render() {
    const firstCardOnPage = (this.state.page - 1) * 20;
    const cards = this.props.cards.slice(firstCardOnPage, firstCardOnPage + 20);
    const maxPages = Math.floor(this.props.cards.length / 20) + 1;

    return (
      <div style={{width: '100%'}}>
        <PageSwitcher
          page={this.state.page}
          maxPages={maxPages}
          prevPage={() => this.setState({page: this.state.page - 1})}
          nextPage={() => this.setState({page: this.state.page + 1})}/>

        {this.renderCardCollection(cards)}

        <PageSwitcher
          page={this.state.page}
          maxPages={maxPages}
          prevPage={() => this.setState({page: this.state.page - 1})}
          nextPage={() => this.setState({page: this.state.page + 1})}/>
      </div>
    );
  }
}
