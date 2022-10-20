import { sortBy, times } from 'lodash';
import * as React from 'react';

import * as w from '../../types';
import { Card } from '../card/Card';
import CardBack from '../card/CardBack';

interface DraftDeckProps {
  cards: Array<w.CardInGame & { rarity?: w.CardInSetRarity }>
}

export default class DraftDeck extends React.PureComponent<DraftDeckProps> {
  public render(): JSX.Element {
    const { cards } = this.props;

    return (
      <div>
        {
          sortBy(cards, ['cost', 'name']).map((card, idx) =>
            <div
              key={idx}
              style={{ float: 'left' }}
            >
              {Card.fromObj(card, { scale: 0.6, rarityInSet: card.rarity })}
            </div>
          )
        }
        {times(30 - cards.length, (idx) =>
          <div
            key={idx}
            style={{
              float: 'left',
              padding: '28px 3px 15px'
            }}
          >
            <CardBack scale={0.6} />
          </div>
        )}
      </div>
    );
  }

}
