import { cloneDeep, isEqual } from 'lodash';
import { applyPatch, compare } from 'fast-json-patch';

import { handleAction } from '../../game';
import { id } from '../../../util/common';
import { currentTutorialStep, passTurn } from '../../../util/game';
import * as actions from '../../../actions/game';
import * as socketActions from '../../../actions/socket';
import * as cards from '../../../store/cards';
import defaultState from '../../../store/defaultGameState';

function nextStep(state) {
  if (state.tutorialCurrentStepIdx < state.tutorialSteps.length) {
    const oldState = cloneDeep(state);
    const currentStep = currentTutorialStep(state);

    if (currentStep.action) {
      state = handleAction(state, currentStep.action);
    }

    (currentStep.responses || []).forEach(response => {
      state = handleAction(state, response);
    });

    if (state.tutorialCurrentStepIdx === state.tutorialSteps.length) {
      state = endTutorial(state);
    } else {
      state.tutorialCurrentStepIdx = state.tutorialCurrentStepIdx + 1;
    }

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

function deck(cardList) {
  const filler = [cards.oneBotCard, cards.oneBotCard, cards.oneBotCard, cards.oneBotCard];
  return cardList.concat(filler).map(card => ({...card, source: 'builtin', id: id()}));
}

export function startTutorial(state) {
  // Reset game state and enable tutorial mode.
  state = Object.assign(state, cloneDeep(defaultState), {
    started: true,
    usernames: {orange: 'Human', blue: 'Computer'},
    tutorial: true,
    tutorialCurrentStepIdx: 0,
    tutorialSteps: tutorialScript,
    undoStack: []
  });

  // Set up.
  state.players.orange.deck = deck([cards.oneBotCard, cards.upgradeCard, cards.rechargeCard]);
  state.players.blue.deck = deck([cards.redBotCard]);
  state.players.orange.robotsOnBoard['3,0,-3'].stats.health = 5;
  state.players.blue.robotsOnBoard['-3,0,3'].stats.health = 3;
  state = passTurn(state, 'orange');
  state = passTurn(state, 'blue');

  return state;
}

export function endTutorial(state) {
  return Object.assign(state, cloneDeep(defaultState), {
    started: false,
    tutorial: false,
    tutorialCurrentStepIdx: 0,
    tutorialSteps: [],
    undoStack: []
  });
}

export function handleTutorialAction(state, action) {
  if (isEqual(action, currentTutorialStep(state).action)) {
    state = nextStep(state);
  } else if (action.type === actions.TUTORIAL_STEP) {
    return action.payload.back ? prevStep(state) : nextStep(state);
  } else if (action.type === actions.END_GAME || action.type === socketActions.LEAVE) {
    state = endTutorial(state);
  } else if ([actions.ATTACK_RETRACT, actions.ATTACK_COMPLETE, actions.SET_HOVERED_TILE].includes(action.type)) {
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
    responses: [actions.setSelectedTile('3,0,-3', 'orange')]
  },
  {
    tooltip: {
      hex: '3,0,-3',
      text: 'This blocky guy here is your kernel. When its health goes to zero, you lose the game. Sad!'
    },
    responses: [actions.setSelectedTile('-3,0,3', 'orange')]
  },
  {
    tooltip: {
      hex: '-3,0,3',
      text: 'And this bad boy is your opponent\'s kernel. Your goal is to destroy it!'
    }
  },
  {
    tooltip: {
      card: 'One Bot',
      text: 'This is your hand of cards. Let\'s click on this One Bot fellow.'
    },
    action: actions.setSelectedCard(0, 'orange')
  },
  {
    tooltip: {
      hex: '2,1,-3',
      text: 'You can play robots anywhere on your kernel\'s edge of the board. This tile over here looks nice. Let\'s click on it.'
    },
    action: actions.placeCard('2,1,-3', 0)
  },
  {
    tooltip: {
      hex: '2,1,-3',
      text: 'Say hello to our new friend, One Bot! It would be nice to move towards the enemy, but robots can\'t move or attack on the turn they\'re played.'
    }
  },
  {
    tooltip: {
      location: 'endTurnButton',
      text: 'There\'s not really anything else we can do this turn. Click this button to end the turn, and we\'ll see what our opponent does.'
    },
    action: actions.passTurn('orange'),
    responses: [actions.passTurn('blue')]
  },
  {
    tooltip: {
      hex: '0,0,0',
      text: 'Looks like our opponent didn\'t do anything on their turn. How very mysterious. But that\'s all the better for us!'
    }
  },
  {
    tooltip: {
      hex: '2,1,-3',
      text: 'Click on this li\'l guy again. It\'s time for One Bot to go on an adventure.'
    },
    action: actions.setSelectedTile('2,1,-3', 'orange')
  },
  {
    tooltip: {
      hex: '0,1,-1',
      text: 'Over on the left you can see One Bot\'s stats. It has a speed of 2, so it can move 2 tiles each turn. Click on this tile to send One Bot here.'
    },
    action: actions.moveRobot('2,1,-3', '0,1,-1')
  },
  {
    tooltip: {
      location: 'endTurnButton',
      text: 'Nice! We\'ve advanced two steps closer to victory. Let\'s end our turn and wait for the opponent.'
    },
    action: actions.passTurn('orange'),
    responses: [
      actions.placeCard('-3,1,2', 0),
      actions.passTurn('blue')
    ]
  },
  {
    tooltip: {
      hex: '-3,1,2',
      text: 'Oh dear, it looks like our opponent has played a robot in our way. And it looks to be an intimidating one!'
    },
    responses: [actions.setSelectedTile('-3,1,2', 'orange')]
  },
  {
    tooltip: {
      hex: '-3,1,2',
      text: 'Let\'s take a closer look: 3 attack and 3 health? There\'s no way our little bot can win in a fair fight ...'
    }
  },
  {
    tooltip: {
      card: 'Upgrade',
      text: 'But who says we want a fair fight? Let\'s give our robot a little boost.'
    }
  },
  {
    tooltip: {
      card: 'Upgrade',
      text: 'Events are cards whose effects happen immediately. Click on this here event card.'
    },
    action: actions.setSelectedCard(0, 'orange')
  },
  {
    tooltip: {
      card: 'Upgrade',
      text: 'And click on it again to confirm that we want to play it.'
    },
    action: actions.setSelectedCard(0, 'orange')
  },
  {
    tooltip: {
      hex: '0,1,-1',
      text: 'Now click our One Bot to apply the Upgrade event to it. Let\'s see what happens!'
    },
    action: actions.setSelectedTile('0,1,-1', 'orange')
  },
  {
    tooltip: {
      hex: '0,1,-1',
      text: 'Wowee! What a transformation! Our robot is now ready to fight with the big boys.'
    }
  },
  {
    tooltip: {
      hex: '0,1,-1',
      text: 'Click on it once more. It\'s time for it to go on a rampage.'
    },
    action: actions.setSelectedTile('0,1,-1', 'orange')
  },
  {
    tooltip: {
      hex: '-3,1,2',
      text: 'Attack the enemy robot!'
    },
    action: actions.moveRobot('0,1,-1', '-2,1,1', true)
  },
  {
    tooltip: {
      hex: '-3,1,2',
      text: 'Attack the enemy robot!'
    },
    action: actions.attack('-2,1,1', '-3,1,2')
  },
  {
    tooltip: {
      hex: '-3,1,2',
      text: 'Okay, what happened here? Our One Bot dealt 3 damage to the enemy robot, which was enough to destroy it. The enemy robot dealt 3 damage to us too, but fortunately our robot just barely survived. Good job, One Bot!'
    }
  },
  {
    tooltip: {
      hex: '-3,1,2',
      text: '(You can see all this information in the game log at the right side of the screen.)'
    }
  },
  {
    tooltip: {
      location: 'endTurnButton',
      text: 'Looks like our turn is over, unless ...'
    }
  },
  {
    tooltip: {
      card: 'Recharge',
      text: 'Are you seeing what I\'m seeing?'
    }
  },
  {
    tooltip: {
      card: 'Recharge',
      text: 'We can recharge our robot to use it again this turn! You know the drill. Click the event card.'
    },
    action: actions.setSelectedCard(0, 'orange')
  },
  {
    tooltip: {
      card: 'Recharge',
      text: 'And click it once more to confirm.'
    },
    action: actions.setSelectedCard(0, 'orange')
  },
  {
    tooltip: {
      hex: '-3,1,2',
      text: 'And would you look at that? Our robot can move again! Select it ...'
    },
    action: actions.setSelectedTile('-3,1,2', 'orange')
  },
  {
    tooltip: {
      hex: '-3,0,3',
      text: '... and smash the enemy kernel to win!'
    },
    action: actions.attack('-3,1,2', '-3,0,3')
  },
  {
    tooltip: {
      hex: '0,0,0',
      text: 'Congratulations! You\'ve completed the tutorial, and you\'re all ready to experience Wordbots. What\'s next? Try playing some games. Make your own cards. Build a deck. The sky\'s the limit! Enjoy your time here :-)'
    }
  }
];
