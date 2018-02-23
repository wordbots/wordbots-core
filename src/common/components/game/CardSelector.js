import React, { Component } from 'react';
import { arrayOf, func, object } from 'prop-types';
import FontIcon from 'material-ui/FontIcon';
import RaisedButton from 'material-ui/RaisedButton';

import CardTooltip from '../card/CardTooltip';

import CardSelectorCard from './CardSelectorCard';

export default class CardSelector extends Component {
  state = {
    selectedCard: null
  }

  static propTypes = {
    onAddCardToTopOfDeck: func,
    cardCollection: arrayOf(object)
  }

  onCardSelect = (card) => {
    const selectedCard = this.state.selectedCard;

    if (card === selectedCard) {
      this.deselectCard();
    } else {
      this.setState({ selectedCard: card });
    }
  }

  deselectCard = () => {
    this.setState({ selectedCard: null });
  }

  onGiveToBlue = () => {
    const selectedCard = this.state.selectedCard;
    this.props.onAddCardToTopOfDeck('blue', selectedCard);
    this.deselectCard();
  }

  onGiveToOrange = () => {
    const selectedCard = this.state.selectedCard;
    this.props.onAddCardToTopOfDeck('orange', selectedCard);
    this.deselectCard();
  }

  get cardsList() {
    const cards = this.props.cardCollection.map((card, index) => 
      <CardTooltip card={card} key={index}>
        <CardSelectorCard 
          card={card}
          selectedCard={this.state.selectedCard}
          onCardSelect={this.onCardSelect} />
      </CardTooltip>
    );

    return (
      <div>{cards}</div>
    );
  }

  renderAddCardToDeckButton = (color, addCardFunction, icon) => (
    <RaisedButton
      style={{ width: '50%' }}
      backgroundColor={color}
      buttonStyle={{
        height: '64px',
        lineHeight: '64px'
      }}
      overlayStyle={{ height: '64px' }}
      onTouchTap={addCardFunction}
      icon={
        <FontIcon
          className="material-icons"
          style={{
            lineHeight: '64px',
            verticalAlign: 'none'
        }}>
          {icon}
        </FontIcon>
      }
      disabled={!this.state.selectedCard} />
  );

  render() {
    const blue = {
      color: 'rgb(186, 219, 255)',
      icon: 'fast_rewind'
    };

    const orange = {
      color: 'rgb(255, 184, 93)',
      icon: 'fast_forward'
    };

    return (
      <div style={{
        height: '100%',
        width: 256
      }}>
        <div style={{
          height: 'calc(100% - 64px)',
          overflowY: 'scroll',
          width: '100%'
        }}>{this.cardsList}</div>
        <div style={{
          height: 64,
          display: 'flex',
          width: '100%'
        }}>
          {this.renderAddCardToDeckButton(blue.color, this.onGiveToBlue, blue.icon)}
          {this.renderAddCardToDeckButton(orange.color, this.onGiveToOrange, orange.icon)}
        </div>
      </div>
    );
  }
}
