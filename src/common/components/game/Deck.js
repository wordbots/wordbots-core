import React, { Component } from 'react';
import { array } from 'prop-types';
import ReactTooltip from 'react-tooltip';

import CardBack from '../card/CardBack';

export default class Deck extends Component {
  static propTypes = {
    deck: array
  };

  render() {
    if (this.props.deck.length > 0) {
      return (
        <div style={{fontFamily: 'Carter One'}}>
          <div data-tip={`${this.props.deck.length  } Cards`} data-for="deck-tooltip">
            <CardBack deckLength={this.props.deck.length} />
          </div>
          <ReactTooltip id="deck-tooltip" />
        </div>
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
