import React, { Component } from 'react';

import Hand from './Hand';
import EnergyCount from './EnergyCount';
import Deck from './Deck';

class PlayerArea extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <EnergyCount energy={this.props.energy} isCurrentPlayer={this.props.isCurrentPlayer} />
        <Hand
          //curved
          name={this.props.name}
          onSelectCard={idx => this.props.onSelectCard(idx, this.props.name)}
          onHoverCard={this.props.onHoverCard}
          selectedCard={this.props.selectedCard}
          hoveredCard={this.props.hoveredCard}
          targetableCards={this.props.targetableCards}
          isCurrentPlayer={this.props.isActivePlayer}
          cards={this.props.cards}
          status={this.props.status} />
        <Deck deck={this.props.deck} />
      </div>
    );
  }
}

const { array, bool, func, number, object, string } = React.PropTypes;

PlayerArea.propTypes = {
  name: string,
  energy: object,
  onSelectCard: func,
  onHoverCard: func,
  selectedCard: number,
  hoveredCard: number,
  targetableCards: array,
  isActivePlayer: bool,
  isCurrentPlayer: bool,
  cards: array,
  status: object,
  deck: array
};

export default PlayerArea;
