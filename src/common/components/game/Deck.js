import React from 'react';
import { arrayOf, object } from 'prop-types';

import Tooltip from '../Tooltip';
import CardBack from '../card/CardBack';

const Deck = ({ deck }) => {
  if (deck.length > 0) {
    return (
      <Tooltip
        text={`${deck.length  } Cards`}
        style={{fontFamily: 'Carter One'}}
      >
        <CardBack deckLength={deck.length} />
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
  deck: arrayOf(object)
};

export default Deck;
