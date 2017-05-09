import React, { Component } from 'react';
import { array } from 'prop-types';

import Tooltip from '../Tooltip';
import CardBack from '../card/CardBack';

export default class Deck extends Component {
  static propTypes = {
    deck: array
  };

  render() {
    if (this.props.deck.length > 0) {
      return (
        <Tooltip
          text={`${this.props.deck.length  } Cards`}
          style={{fontFamily: 'Carter One'}}
        >
          <CardBack deckLength={this.props.deck.length} />
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
  }
}
