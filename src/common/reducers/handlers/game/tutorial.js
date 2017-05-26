import { cloneDeep, isEqual } from 'lodash';
import { apply as applyPatch, compare } from 'fast-json-patch';

import { handleAction } from '../../game';
import { currentTutorialStep, passTurn } from '../../../util/game';
import * as actions from '../../../actions/game';
import * as cards from '../../../store/cards';
import defaultState from '../../../store/defaultGameState';

import { placeCard } from './cards';

function nextStep(state) {
  if (state.tutorialCurrentStepIdx < state.tutorialSteps.length) {
    const oldState = cloneDeep(state);
    const action = currentTutorialStep(state).action;

    if (action) {
      state = handleAction(state, action);
    }

    state.tutorialCurrentStepIdx = state.tutorialCurrentStepIdx + 1;
    state.undoStack.push(compare(state, oldState));
  }

  return state;
}

function prevStep(state) {
  if (state.undoStack.length > 0) {
    applyPatch(state, state.undoStack.pop());
  }

  return state;
}

export function startTutorial(state) {
  // Reset game state and enable tutorial mode.
  state = Object.assign(state, cloneDeep(defaultState), {
    started: true,
    usernames: {orange: 'You', blue: 'CPU'},
    tutorial: true,
    tutorialCurrentStepIdx: 0,
    tutorialSteps: tutorialScript,
    undoStack: []
  });

  // Set up the decks, hand, and board as we want it.
  state.players.orange.hand = [cards.oneBotCard];
  state = placeCard(state, 0, '1,1,-2', true);

  // Start new turn.
  state = passTurn(state, 'orange');
  state = passTurn(state, 'blue');
  state.sfxQueue = ['yourmove.wav'];

  return state;
}

export function handleTutorialAction(state, action) {
  if (isEqual(action, currentTutorialStep(state).action)) {
    state = nextStep(state);
  } else if (action.type === actions.TUTORIAL_STEP) {
    return action.payload.back ? prevStep(state) : nextStep(state);
  } else if (action.type === actions.SET_HOVERED_TILE) {
    return handleAction(state, action);
  }

  return state;
}

const tutorialScript = [
  {
    tooltip: {
      hex: '0,0,0',
      text: 'Welcome to Wordbots! This tutorial will teach you the basics. Click NEXT to continue.'
    },
    action: actions.setSelectedTile('3,0,-3', 'orange')
  },
  {
    tooltip: {
      hex: '3,0,-3',
      text: 'This blocky guy here is your kernel. When its health goes to zero, you lose the game. Sad!'
    },
    action: actions.setSelectedTile('-3,0,3', 'orange')
  },
  {
    tooltip: {
      hex: '-3,0,3',
      text: 'And this bad boy is your opponent\'s kernel. Your goal is to destroy it!'
    }
  },
  {
    tooltip: {
      hex: '1,1,-2',
      text: 'Looks like we already have a robot out on the field. Why don\'t you click on it?'
    },
    action: actions.setSelectedTile('1,1,-2', 'orange')
  },
  {
    tooltip: {
      hex: '-1,1,0',
      text: 'Say hello to our new friend, One Bot! Let\'s move him over to this hex by clicking on it.'
    },
    action: actions.moveRobot('1,1,-2', '-1,1,0')
  },
  {
    tooltip: {
      hex: '-1,1,0',
      text: 'We\'re a few steps closer to victory! But we can\'t quite reach the kernel yet. Let\'s end our turn (click the End Turn button in the top left menu) and see what our opponent does.'
    },
    action: actions.passTurn('orange')
  },
  {
    tooltip: {
      hex: '0,0,0',
      text: 'TODO: Continue tutorial.'
    }
  }
];
