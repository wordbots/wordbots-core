import { newGame, passTurn } from '../../util/game';

import { setSelectedCard, placeCard } from './game/cards';
import { setHoveredTile, setSelectedTile, moveRobot, attack, activateObject } from './game/board';
import { startTutorial, handleTutorialAction } from './game/tutorial';

const gameHandlers = {
  newGame,
  passTurn,

  setSelectedCard,
  placeCard,

  setHoveredTile,
  setSelectedTile,
  moveRobot,
  attack,
  activateObject,

  startTutorial,
  handleTutorialAction
};

export default gameHandlers;
