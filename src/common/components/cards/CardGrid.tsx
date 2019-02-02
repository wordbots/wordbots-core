import * as React from 'react';

import * as w from '../../types';
import { id } from '../../util/common';
import { inBrowser } from '../../util/browser';
import { splitSentences } from '../../util/cards';
import Card from '../card/Card';
import Sentence from '../card/Sentence';

import { CardGridOrTableProps } from './CardCollection';

export default class CardGrid extends React.Component<CardGridOrTableProps> {
  public render(): JSX.Element {
    return (
      <div style={{
        width: 'calc(100% - 40px)',
        margin: '0 20px'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-start'
        }}>{!inBrowser() ? null : this.props.cards.map(this.renderCard)}</div>
      </div>
    );
  }

  private renderCard = (card: w.CardInStore) => (
    <div
      key={card.id || id()}
      style={{
        marginRight: 15,
        marginTop: -12
    }}>
      <Card
        collection
        id={card.id}
        name={card.name}
        spriteID={card.spriteID}
        spriteV={card.spriteV}
        type={card.type}
        text={splitSentences(card.text).map((text) => Sentence(text))}
        rawText={card.text || ''}
        stats={card.stats}
        cardStats={card.stats}
        cost={card.cost}
        baseCost={card.cost}
        source={card.source}
        selected={this.props.selectable && this.props.selectedCardIds.includes(card.id)}
        onCardClick={this.props.onCardClick} />
    </div>
  )
}
