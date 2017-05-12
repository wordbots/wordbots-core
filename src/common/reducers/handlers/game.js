import { newGame, passTurn } from '../../util/game';

import { setSelectedCard, placeCard } from './game/cards';
import { setHoveredTile, setSelectedTile, moveRobot, attack, activateObject } from './game/board';

const gameHandlers = {
  newGame: newGame,
  passTurn: passTurn,

  setSelectedCard: setSelectedCard,
  placeCard: placeCard,

  setHoveredTile: setHoveredTile,
  setSelectedTile: setSelectedTile,
  moveRobot: moveRobot,
  attack: attack,
  activateObject: activateObject
};

export default gameHandlers;
