import { startTurn, endTurn } from './game/turns';
import { setSelectedCard, placeCard } from './game/cards';
import { setHoveredCard, setSelectedTile, moveRobot, attack } from './game/board';

const gameHandlers = {
  startTurn: startTurn,
  endTurn: endTurn,

  setSelectedCard: setSelectedCard,
  placeCard: placeCard,

  setHoveredCard: setHoveredCard,
  setSelectedTile: setSelectedTile,
  moveRobot: moveRobot,
  attack: attack
};

export default gameHandlers;
