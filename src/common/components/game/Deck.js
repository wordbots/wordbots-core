import * as React from 'react';
import { arrayOf, bool, object } from 'prop-types';

import Tooltip from '../Tooltip';
import Card from '../card/Card.tsx';
import CardBack from '../card/CardBack.tsx';

const Deck = ({ deck, opponent, reveal = false }) => {
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
      <div style={{
        width: 140,
        height: 200,
        borderRadius: 5,
        border: '2px dashed #DDD',
        display: 'flex',
        alignItems: 'center',
        userSelect: 'none'
      }}>
        <div style={{
          margin: 'auto',
          fontFamily: 'Carter One',
          fontSize: 32,
          textAlign: 'center',
          color: '#CCC'
        }}>NO CARDS LEFT</div>
      </div>
    );
  }
};

Deck.propTypes = {
  deck: arrayOf(object),
  isUpsideDown: bool,
  reveal: bool
};

export default Deck;
