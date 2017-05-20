import { cloneDeep, isEqual } from 'lodash';

import { handleAction } from '../../game';
import { currentTutorialStep, triggerSound } from '../../../util/game';
import { TUTORIAL_STEP } from '../../../actions/game';
import { tutorialState } from '../../../store/defaultGameState';

function nextStep(state) {
  if (state.tutorialCurrentStepIdx < state.tutorialSteps.length) {
    const oldState = cloneDeep(state);
    const action = currentTutorialStep(state).action;

    state = handleAction(state, action);
    state = Object.assign({}, state, {
      prev: oldState,
      tutorialCurrentStepIdx: state.tutorialCurrentStepIdx + 1
    });
  }

  return state;
}

function prevStep(state) {
  return state.prev || state;
}

export function startTutorial(state) {
  // Reset game state and enable tutorial mode.
  state = Object.assign(state, cloneDeep(tutorialState));
  state = triggerSound(state, 'yourmove.wav');
  return state;
}

export function handleTutorialAction(state, action, reducer) {
  if (isEqual(action, currentTutorialStep(state).action)) {
    state = nextStep(state);
  } else if (action.type === TUTORIAL_STEP) {
    return action.payload.back ? prevStep(state) : nextStep(state);
  }

  return state;
}
