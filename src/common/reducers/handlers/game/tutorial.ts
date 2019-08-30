import { cloneDeep, isEqual } from 'lodash';

import * as actions from '../../../actions/game';
import * as socketActions from '../../../actions/socket';
import { TYPE_EVENT } from '../../../constants';
import * as cards from '../../../store/cards';
import defaultState from '../../../store/defaultGameState';
import * as w from '../../../types';
import { instantiateCard } from '../../../util/cards';
import { id } from '../../../util/common';
import { lookupUsername } from '../../../util/firebase';
import { currentTutorialStep, passTurn } from '../../../util/game';
import { handleAction } from '../../game';

type State = w.GameState;

function nextStep(state: State, action: w.Action | null = null): State {
  function isAction(a: w.Action | string | undefined): a is w.Action {
    return !!a && (a as w.Action).type !== undefined;
  }

  if (state.tutorialCurrentStepIdx! < state.tutorialSteps!.length) {
    const currentStep: w.TutorialStep = currentTutorialStep(state)!;
    action = action || (isAction(currentStep.action) ? currentStep.action : null);

    if (action) {
      state = handleAction(state, action);
    }

    (currentStep.responses || []).forEach((response) => {
      state = handleAction(state, response);
    });

    if (state.tutorialCurrentStepIdx === state.tutorialSteps!.length) {
      state = endTutorial(state);
    } else {
      state.tutorialCurrentStepIdx = state.tutorialCurrentStepIdx! + 1;
      state.tutorialActionsPerformed!.push(action || null);
    }
  }

  return state;
}

function prevStep(state: State): State {
  const lastActionPerformed: w.Action | null = state.tutorialActionsPerformed!.pop()!;

  if (lastActionPerformed) {
    // Replay tutorial from the beginning up to the last action.
    let newState = startTutorial(state);
    state.tutorialActionsPerformed!.forEach((action) => {
      newState = nextStep(newState, action);
    });
    return newState;
  } else {
    // No action was performed, so just wind back the tutorial step index.
    state.tutorialCurrentStepIdx = state.tutorialCurrentStepIdx! - 1;
    return state;
  }
}

function deck(cardList: w.CardInGame[]): w.CardInGame[] {
  const filler: w.CardInGame[] = Array(4).fill(cards.oneBotCard).map((card) => instantiateCard({...card, id: id()}));
  return cardList.concat(filler);
}

export function startTutorial(state: State): State {
  // Reset game state and enable tutorial mode.
  state = {
    ...state, ...cloneDeep(defaultState),
    started: true,
    usernames: {orange: lookupUsername(), blue: 'Computer'},
    tutorial: true,
    tutorialActionsPerformed: [],
    tutorialCurrentStepIdx: 0,
    tutorialSteps: tutorialScript
  };

  // Set up.
  state.players.orange.deck = deck([
    cards.oneBotCard,
    tutorialExclusiveCards.upgradeCard,
    tutorialExclusiveCards.rechargeCard
  ].map((card) => instantiateCard({...card, id: id()})));
  state.players.blue.deck = deck([
    cards.redBotCard
  ].map((card) => instantiateCard({...card, id: id()})));
  state.players.orange.robotsOnBoard['3,0,-3'].stats.health = 5;
  state.players.blue.robotsOnBoard['-3,0,3'].stats.health = 3;
  state = passTurn(state, 'orange');
  state = passTurn(state, 'blue');

  return state;
}

function endTutorial(state: State): State {
  return {
    ...state,
    ...cloneDeep(defaultState),
    started: false,
    tutorial: false,
    tutorialCurrentStepIdx: 0,
    tutorialSteps: [],
    tutorialActionsPerformed: []
  };
}

export function handleTutorialAction(state: State, action: w.Action): State {
  const expectedAction: w.Action | string | undefined = currentTutorialStep(state)!.action;
  if (isEqual(action, expectedAction) || (action.type === expectedAction)) {
    state = nextStep(state, action);
  } else if (action.type === actions.TUTORIAL_STEP) {
    return action.payload.back ? prevStep(state) : nextStep(state);
  } else if (action.type === actions.END_GAME || action.type === socketActions.LEAVE) {
    state = endTutorial(state);
  } else if ([actions.ATTACK_RETRACT, actions.ATTACK_COMPLETE].includes(action.type)) {
    return handleAction(state, action);
  }

  return state;
}

const tutorialExclusiveCards: Record<string, w.CardInStore> = {
  upgradeCard: {
    id: 'upgrade',
    name: 'Upgrade',
    text: 'Give a robot +2 attack and +2 health.',
    command: '(function () { (function () { save("target", targets["choose"](objectsMatchingConditions("robot", []))); })(); (function () { actions["modifyAttribute"](load("target"), "attack", function (x) { return x + 2; }); })(); (function () { actions["modifyAttribute"](load("target"), "health", function (x) { return x + 2; }); })(); })',
    cost: 2,
    type: TYPE_EVENT
  },
  rechargeCard: {
    id: 'recharge',
    name: 'Recharge',
    text: 'All of your robots can move and attack again.',
    command: '(function () { actions["canMoveAndAttackAgain"](objectsMatchingConditions("robot", [conditions["controlledBy"](targets["self"]())])); })',
    cost: 2,
    type: TYPE_EVENT
  }
};

const tutorialScript: w.TutorialStepInScript[] = [
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
      text: 'This blocky guy here is your kernel. When its health goes to zero, you lose the game.'
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
    action: actions.placeCard('2,1,-3', 0),
    highlight: true
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
      text: 'Hover your cursor over One Bot to see its stats. It has a speed of 2, so it can move 2 tiles each turn. Click on this tile to send One Bot here.',
      place: 'left'
    },
    action: actions.moveRobot('2,1,-3', '0,1,-1'),
    highlight: true
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
      text: 'It\'s got 3 attack and 3 health! There\'s no way our little bot can win in a fair fight ...'
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
    action: actions.moveRobot('0,1,-1', '-2,1,1'),
    responses: [actions.setSelectedTile('-2,1,1', 'orange')]
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
      text: 'This event affects the whole board, so click anywhere on the board to play it.'
    },
    action: actions.SET_SELECTED_TILE
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
