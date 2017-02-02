import React, { Component, PropTypes } from 'react';

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
          onSelectCard={(index) => {
            this.props.onSelectCard(index);
          }}
          selectedCard={this.props.selectedCard}
          isCurrentPlayer={this.props.isCurrentPlayer}
          cards={this.props.cards}
          status={this.props.status} />
        <Deck deck={this.props.deck} />
      </div>
    );
  }
}

PlayerArea.propTypes = {
  energy: React.PropTypes.object,
  onSelectCard: React.PropTypes.func,
  selectedCard: React.PropTypes.number,
  isCurrentPlayer: React.PropTypes.bool,
  cards: React.PropTypes.array,
  status: React.PropTypes.object,
  deck: React.PropTypes.array
};

export default PlayerArea;
