import React, { Component } from 'react';
import { object, string } from 'prop-types';

import Hand from './Hand';
import EnergyCount from './EnergyCount';
import Deck from './Deck';

class PlayerArea extends Component {
  getColor(opponent, playerColor) {
    if (opponent) {
      if (playerColor === 'blue') {
        return 'orange';
      } else {
        return 'blue';
      }
    } else {
      return playerColor;
    }
  }

  render() {
    let opponent = this.props.opponent;
    let gameProps = this.props.gameProps;

    let color = this.getColor(opponent, gameProps.player);

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: 20
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
  gameProps: object
};

export default PlayerArea;
