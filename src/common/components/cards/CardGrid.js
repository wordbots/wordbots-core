import React, { Component } from 'react';
import { array, element, func } from 'prop-types';

import { inBrowser } from '../../util/common';
import { splitSentences } from '../../util/cards';
import Card from '../card/Card';
import Sentence from '../card/Sentence';

import PageSwitcher from './PageSwitcher';

export default class CardGrid extends Component {
  static propTypes = {
    children: element,
    cards: array,
    selectedCardIds: array,

    onCardClick: func
  };

  constructor(props) {
    super(props);

    this.state = {
      page: 1
    };
  }

  renderCard(card) {
    return (
      <div
        key={card.id}
        style={{
          marginRight: 15
      }}>
        <Card
          collection
          id={card.id}
          name={card.name}
          spriteID={card.spriteID}
          type={card.type}
          text={splitSentences(card.text).map(Sentence)}
          rawText={card.text || ''}
          stats={card.stats}
          cardStats={card.stats}
          cost={card.cost}
          baseCost={card.cost}
          source={card.source}
          selected={(this.props.selectedCardIds || []).includes(card.id)}
          onCardClick={this.props.onCardClick} />
      </div>
    );
  }

  render() {
    const firstCardOnPage = (this.state.page - 1) * 20;
    const cards = this.props.cards.slice(firstCardOnPage, firstCardOnPage + 20);
    const maxPages = Math.floor(this.props.cards.length / 20) + 1;

    return (
      <div style={{
        width: 'calc(100% - 10px)'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-start'
        }}>{!inBrowser() ? null : cards.map(this.renderCard.bind(this))}</div>
        
        <PageSwitcher
          page={this.state.page}
          maxPages={maxPages}
          prevPage={() => this.setState({page: this.state.page - 1})}
          nextPage={() => this.setState({page: this.state.page + 1})}/>
      </div>
    );
  }
}

