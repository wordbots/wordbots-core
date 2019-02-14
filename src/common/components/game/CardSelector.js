import * as React from 'react';
import { arrayOf, func, object } from 'prop-types';
import FontIcon from 'material-ui/FontIcon';
import RaisedButton from 'material-ui/RaisedButton';
import { sortBy } from 'lodash';

import Tooltip from '../Tooltip';
import CardTooltip from '../card/CardTooltip.tsx';

import CardSelectorCard from './CardSelectorCard';

export default class CardSelector extends React.Component {
  state = {
    selectedCard: null
  }

  static propTypes = {
    onAddCardToTopOfDeck: func,
    cardCollection: arrayOf(object)
  }

  buttons = {
    blue: {
      color: 'rgb(186, 219, 255)',
      icon: 'fast_forward'
    },
    orange: {
      color: 'rgb(255, 184, 93)',
      icon: 'fast_rewind'
    }
  }

  handleSelectCard = (card) => {
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

  handleGiveCard = (player) => () => {
    const { selectedCard } = this.state;
    if (selectedCard) {
      this.props.onAddCardToTopOfDeck(player, selectedCard);
    }
  }

  get cardsList() {
    const { cardCollection } = this.props;

    return sortBy(cardCollection, 'cost').map((card, index) =>
      <CardTooltip card={card} key={index}>
        <CardSelectorCard
          card={card}
          selectedCard={this.state.selectedCard}
          onCardSelect={this.handleSelectCard} />
      </CardTooltip>
    );
  }

  renderAddCardToDeckButton = (player) =>
    <Tooltip
      text={`Place card on top of ${player} deck.`}
      place="left"
    >
      <RaisedButton
        style={{ width: 128 }}
        backgroundColor={this.buttons[player].color}
        buttonStyle={{
          height: '64px',
          lineHeight: '64px'
        }}
        overlayStyle={{ height: '64px' }}
        onClick={this.handleGiveCard(player)}
        icon={
            <FontIcon
              className="material-icons"
              style={{
                lineHeight: '64px',
                verticalAlign: 'none'
            }}>
              {this.buttons[player].icon}
            </FontIcon>
        }
        disabled={!this.state.selectedCard} />
    </Tooltip>;

  render = () =>
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
        {this.renderAddCardToDeckButton('orange')}
        {this.renderAddCardToDeckButton('blue')}
      </div>
    </div>;
}
