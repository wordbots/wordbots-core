import { startTurn, endTurn, startNewGame } from './game/turns';
import { setSelectedCard, placeCard } from './game/cards';
import { setHoveredTile, setSelectedTile, moveRobot, attack } from './game/board';

const gameHandlers = {
  startTurn: startTurn,
  endTurn: endTurn,
  newGame: startNewGame,

  setSelectedCard: setSelectedCard,
  placeCard: placeCard,

  setHoveredTile: setHoveredTile,
  setSelectedTile: setSelectedTile,
  moveRobot: moveRobot,
  attack: attack
};

export default gameHandlers;
