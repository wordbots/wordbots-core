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
  state.players.orange.deck = deck([
    cards.oneBotCard,
    tutorialExclusiveCards.upgradeCard,
    tutorialExclusiveCards.rechargeCard
  ]);
  state.players.blue.deck = deck([cards.redBotCard]);
  state.players.orange.robotsOnBoard['3,0,-3'].stats.health = 5;
  state.players.blue.robotsOnBoard['-3,0,3'].stats.health = 3;
  state = passTurn(state, 'orange');
  state = passTurn(state, 'blue');

  return state;
}