import React, { Component } from 'react';
import { func, object } from 'prop-types';

import CardTooltip from '../card/CardTooltip';

export default class ActiveDeckCard extends Component {
  static propTypes = {
    card: object,

    onIncreaseCardCount: func,
    onDecreaseCardCount: func
  }

  styles = {
    outerCard: {
      display: 'flex',
      alignItems: 'stretch',
      cursor: 'pointer',
      height: 30,
      marginBottom: -2,
      borderRadius: 5,
      border: '2px solid #444'
    },
    cardCost: {
      width: 30,
      color: 'white',
      fontFamily: 'Carter One',
      backgroundColor: '#00bcd4',
      justifyContent: 'center',
      display: 'flex',
      alignItems: 'center',
      borderTopLeftRadius: 4,
      borderBottomLeftRadius: 4,
      borderRight: '2px solid #444'
    },
    cardName: {
      width: 'calc(100% - 65px)',
      marginLeft: 5,
      display: 'flex',
      alignItems: 'center'
    },
    cardCount: {
      width: 65,
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  };

  handleDecreaseCardCount = () => { this.props.onDecreaseCardCount(this.props.card.id); };
  handleIncreaseCardCount = () => { this.props.onIncreaseCardCount(this.props.card.id); };

  render = () => {
    const { card } = this.props;
    return (
      <CardTooltip card={card}>
        <div style={this.styles.outerCard}>
          <div style={this.styles.cardCost}>{card.cost}</div>
          <div style={this.styles.cardName}>{card.name}</div>
          <div style={this.styles.cardCount}>
            <span onClick={this.handleDecreaseCardCount}>
              &nbsp;&ndash;&nbsp;
            </span>
            {card.count}
            <span onClick={this.handleIncreaseCardCount}>
              &nbsp;+&nbsp;
            </span>
          </div>
        </div>
      </CardTooltip>
    );
  };
}
