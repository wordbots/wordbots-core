import * as React from 'react';

import * as w from '../../types';
import { inBrowser } from '../../util/browser';
import { id } from '../../util/common';
import Card from '../card/Card';
import Sentence from '../card/Sentence';

import { CardGridOrTableProps } from './CardCollection';
import CardProvenanceDescription from './CardProvenanceDescription';

export default class CardGrid extends React.Component<CardGridOrTableProps> {
  public render(): JSX.Element {
    return (
      <div
        style={{
          width: '100%',
          margin: '0 20px'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'flex-start'
          }}
        >
          {!inBrowser() ? null : this.props.cards.map(this.renderCard)}
        </div>
      </div>
    );
  }

  private renderCard = (card: w.CardInStore) => (
    <div
      key={card.id || id()}
      style={{
        marginRight: 15,
        marginTop: -12
      }}
    >
      <Card
        collection
        visible
        id={card.id}
        name={card.name}
        spriteID={card.spriteID}
        spriteV={card.spriteV}
        type={card.type}
        text={Sentence.fromText(card.text)}
        rawText={card.text || ''}
        stats={card.stats || {}}
        cardStats={card.stats || {}}
        cost={card.cost}
        baseCost={card.cost}
        source={card.metadata.source}
        selected={this.props.selectable && this.props.selectedCardIds.includes(card.id)}
        onCardClick={this.props.onCardClick}
      />
      <CardProvenanceDescription
        card={card}
        style={{
          fontSize: 11,
          color: '#888',
          maxWidth: 140,
          padding: '1px 3px',
          background: `rgba(255, 255, 255, 0.8)`,
          borderRadius: 5
        }}
      />
    </div>
  )
}
