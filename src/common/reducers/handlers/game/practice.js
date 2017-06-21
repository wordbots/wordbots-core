import { cloneDeep } from 'lodash';

import { id } from '../../../util/common';
import * as cards from '../../../store/cards';
import defaultState from '../../../store/defaultGameState';

export function startPractice(state) {
  // Reset game state and enable tutorial mode.
  state = Object.assign(state, cloneDeep(defaultState), {
    started: true,
    usernames: {orange: 'Human', blue: 'Computer'}
  });

  // Set up.
  state.players.orange.deck = deck([cards.oneBotCard, cards.upgradeCard, cards.rechargeCard]);
  state.players.blue.deck = deck([cards.redBotCard]);
  state.players.orange.robotsOnBoard['3,0,-3'].stats.health = 5;
  state.players.blue.robotsOnBoard['-3,0,3'].stats.health = 3;

  return state;
}

function deck(cardList) {
  const filler = [cards.oneBotCard, cards.oneBotCard, cards.oneBotCard, cards.oneBotCard];
  return cardList.concat(filler).map(card => Object.assign({}, card, {id: id()}));
}
