import { isString } from 'lodash';

import * as actions from '../../src/common/actions/game';
import game from '../../src/common/reducers/game';
import * as w from '../../src/common/types';

describe('Game reducer: tutorial mode', () => {
  it('should be able to start the tutorial', () => {
    const initialState = game();
    const state = game(initialState, actions.startTutorial());
    expect(state.tutorial).toEqual(true);
    expect(state.tutorialCurrentStepIdx).toEqual(0);
  });

  it('should be able to go through each step of the tutorial, forward, backward, and forward again', () => {
    function forward(s: w.GameState): w.GameState {
      while (s.tutorialSteps!.length > s.tutorialCurrentStepIdx!) {
        const currentStep = s.tutorialSteps![s.tutorialCurrentStepIdx!];

        if (currentStep.action && !isString(currentStep.action)) {
          s = game(s, currentStep.action!);
        } else {
          s = game(s, actions.tutorialStep());
        }
      }
      return s;
    }

    function backward(s: w.GameState): w.GameState {
      while (s.tutorialCurrentStepIdx! > 0) {
        s = game(s, actions.tutorialStep(true));
      }
      return s;
    }

    const initialState = game();
    let state = game(initialState, actions.startTutorial());

    state = forward(state);
    expect(state.tutorialCurrentStepIdx).toEqual(state.tutorialSteps!.length);

    state = backward(state);
    expect(state.tutorialCurrentStepIdx).toEqual(0);

    state = forward(state);
    expect(state.tutorialCurrentStepIdx).toEqual(state.tutorialSteps!.length);
  });
});
