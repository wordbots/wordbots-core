import { newGame, passTurn } from '../../util/game';

import { setSelectedCard, placeCard } from './game/cards';
import { setHoveredTile, setSelectedTile, moveRobot, attack, activateObject } from './game/board';
import { startTutorial, handleTutorialAction } from './game/tutorial';
import { startPractice } from './game/practice';

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
  handleTutorialAction,

  startPractice
};

export default gameHandlers;
