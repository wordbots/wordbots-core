import React, { Component } from 'react';
import { array, object, oneOfType } from 'prop-types';
import ReactTooltip from 'react-tooltip';

import { id } from '../../util/common';
import { splitSentences } from '../../util/cards';

import Card from './Card';
import Sentence from './Sentence';

export default class CardTooltip extends Component {
  static propTypes = {
    card: object,
    children: oneOfType([array, object])
  };

  tooltipId = id()

  get renderedCard() {
    const card = this.props.card;
    return (
      <Card
        id={card.id}
        name={card.name}
        spriteID={card.spriteID}
        spriteV={card.spriteV}
        type={card.type}
        text={splitSentences(card.text).map(Sentence)}
        rawText={card.text || ''}
        stats={card.stats}
        cardStats={card.stats}
        cost={card.cost}
        baseCost={card.cost}
        source={card.source} />
    );
  }

  render() {
    return (
      <span>
        <span data-tip="" data-for={this.tooltipId}>
          {this.props.children}
        </span>
        <span style={{zIndex: 99999, backgroundColor: 'transparent'}}>
          <ReactTooltip
            id={this.tooltipId}
            className="hovered-card"
            place="top"
          >
            {this.renderedCard}
          </ReactTooltip>
        </span>
      </span>
    );
  }
}
