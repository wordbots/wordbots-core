import React from 'react';
import { object, string } from 'prop-types';

import Hand from './Hand';
import EnergyCount from './EnergyCount';
import Deck from './Deck';

const PlayerArea = ({color, gameProps}) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }}>
    <EnergyCount
      color={color}
      playerName={gameProps.player === color ? 'You' : 'Opponent'}
      energy={gameProps[`${color}Energy`]}
      isCurrentPlayer={gameProps.currentTurn === color} />
    <Hand
      //curved
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

PlayerArea.propTypes = {
  color: string,
  gameProps: object
};

export default PlayerArea;
