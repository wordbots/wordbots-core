import React, { Component } from 'react';
import { object, func } from 'prop-types';
import { isEqual } from 'lodash';

export default class CardSelectorCard extends Component {
  static propTypes = {
    card: object,
    selectedCard: object,
    onCardSelect: func
  };

  onCardSelect = () => {
    this.props.onCardSelect(this.props.card);
  }

  render() {
    const { card, selectedCard } = this.props;
    const backgroundColor = isEqual(selectedCard, card) ? '#BBB' : 
      (card.source === 'builtin' ? 'white' : '#FFB4B3'); 

    return (
      <div 
        onClick={this.onCardSelect}
        style={{
        display: 'flex',
        borderBottom: '2px solid black',
        borderRight: '2px solid black',
        borderLeft: '2px solid black',
        backgroundColor: backgroundColor,
        cursor: 'pointer',
        height: 30,
        alignItems: 'center'
      }}>
        <div style={{
          backgroundColor: 'rgb(0, 188, 212)',
          color: 'white',
          borderRight: '2px solid black',
          fontFamily: 'Carter One',
          width: 30,
          height: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>{card.cost}</div>
        <div style={{
          width: 'calc(100% - 30px)',
          paddingLeft: 5
        }}>{card.name}</div>
      </div>
    );
  }
}
