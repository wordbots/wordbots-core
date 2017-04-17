import React, { Component } from 'react';
import { object, string, bool } from 'prop-types';

import Hand from './Hand';
import EnergyCount from './EnergyCount';
import Deck from './Deck';

class PlayerArea extends Component {
  getColor(opponent, playerColor) {
    if (opponent) {
      return (playerColor === 'blue') ? 'orange' : 'blue';
    } else {
      return (playerColor === 'neither') ? 'orange' : playerColor;
    }
  }

  render() {
    const opponent = this.props.opponent;
    const gameProps = this.props.gameProps;
    const color = this.getColor(opponent, gameProps.player);

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'absolute',
        overflow: 'hidden',
        padding: 20,
        bottom: opponent ? 'auto' : 0,
        top: opponent ? 0 : 'auto',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <EnergyCount
          color={color}
          playerName={gameProps.player === color ? 'You' : gameProps.usernames[color]}
          energy={gameProps[`${color}Energy`]}
          isCurrentPlayer={gameProps.currentTurn === color} />
        <Hand
          // curved
          opponent={opponent}
          name={color}
          onSelectCard={idx => gameProps.onSelectCard(idx, color)}
          onHoverCard={gameProps.onHoverCard}
          selectedCard={gameProps.selectedCard}
          hoveredCard={gameProps.hoveredCardIdx}
          targetableCards={gameProps.target.possibleCards}
          isActivePlayer={gameProps.player === color}
          cards={gameProps[`${color}Hand`]}
          status={gameProps.status} />
        <Deck deck={gameProps[`${color}Deck`]} />
      </div>
    );
  }
}

PlayerArea.propTypes = {
  color: string,
  gameProps: object,
  opponent: bool
};

export default PlayerArea;
