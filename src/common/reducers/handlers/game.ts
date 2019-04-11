import { newGame, passTurn } from '../../util/game';

import { activateObject, attack, attackComplete, deselect, moveRobot, setSelectedTile } from './game/board';
import { placeCard, setSelectedCard } from './game/cards';
import { aiResponse, startPractice, startSandbox } from './game/practice';
import { handleTutorialAction, startTutorial } from './game/tutorial';

// All handlers for game actions.
const game = {
  newGame,
  passTurn,

  setSelectedCard,
  placeCard,

  deselect,
  setSelectedTile,
  moveRobot,
  attack,
  attackComplete,
  activateObject,

  startTutorial,
  handleTutorialAction,

  startPractice,
  startSandbox,
  aiResponse
};

export default game;
