import { cloneDeep, isEqual } from 'lodash';

import { currentTutorialStep, triggerSound } from '../../../util/game';
import { handleAction } from '../../game';
import { tutorialState } from '../../../store/defaultGameState';

function advanceStep(state) {
  const maxStep = state.tutorialSteps.length - 1;
  return Object.assign({}, state, {
    tutorialCurrentStepIdx: Math.min(state.tutorialCurrentStepIdx + 1, maxStep)
  });
}

export function startTutorial(state) {
  // Reset game state and enable tutorial mode.
  state = Object.assign(state, cloneDeep(tutorialState));
  state = triggerSound(state, 'yourmove.wav');
  return state;
}

export function handleTutorialAction(state, action, reducer) {
  if (isEqual(action, currentTutorialStep(state).action)) {
    state = handleAction(state, action);
    state = advanceStep(state);
  }

  return state;
}
