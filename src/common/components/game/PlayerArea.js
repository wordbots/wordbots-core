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
        <EnergyCount energy={this.props.energy} />
        <Hand
          //curved
          name={this.props.name}
          onSelectCard={this.props.onSelectCard}
          onHoverCard={this.props.onHoverCard}
          selectedCard={this.props.selectedCard}
          hoveredCard={this.props.hoveredCard}
          targetableCards={this.props.targetableCards}
          isCurrentPlayer={this.props.isCurrentPlayer}
          cards={this.props.cards}
          status={this.props.status} />
        <Deck deck={this.props.deck} />
      </div>
    );
  }
}

PlayerArea.propTypes = {
  name: React.PropTypes.string,
  energy: React.PropTypes.object,
  onSelectCard: React.PropTypes.func,
  onHoverCard: React.PropTypes.func,
  selectedCard: React.PropTypes.number,
  hoveredCard: React.PropTypes.number,
  targetableCards: React.PropTypes.array,
  isCurrentPlayer: React.PropTypes.bool,
  cards: React.PropTypes.array,
  status: React.PropTypes.object,
  deck: React.PropTypes.array
};

export default PlayerArea;
