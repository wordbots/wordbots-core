import * as React from 'react';

import * as w from '../../types';
import Card from '../card/Card';
import CardBack from '../card/CardBack';
import Tooltip from '../Tooltip';

interface DeckProps {
  deck: w.PossiblyObfuscatedCard[]
  opponent?: boolean
  reveal?: boolean
}

export default class Deck extends React.Component<DeckProps> {
  public render(): JSX.Element {
    const { deck, opponent, reveal } = this.props;

    if (deck.length > 0) {
      return (
        <Tooltip
          text={`${deck.length} Cards`}
          style={{fontFamily: 'Carter One'}}
        >
          {
            reveal ?
              Card.fromObj(deck[0], {rotation: opponent ? 180 : 0}) :
              <CardBack deckLength={deck.length} />
          }
        </Tooltip>
      );
    } else {
      return (
        <div
          style={{
            width: 140,
            height: 200,
            borderRadius: 5,
            border: '2px dashed #DDD',
            display: 'flex',
            alignItems: 'center',
            userSelect: 'none'
          }}
        >
          <div
            style={{
              margin: 'auto',
              fontFamily: 'Carter One',
              fontSize: 32,
              textAlign: 'center',
              color: '#CCC'
            }}
          >
            NO CARDS LEFT
          </div>
        </div>
      );
    }
  }
}
