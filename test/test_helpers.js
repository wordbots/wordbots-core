import game from '../src/common/reducers/game';
import * as actions from '../src/common/actions/game';
import { deck } from '../src/common/store/cards';
import { allObjectsOnBoard } from '../src/common/util';

export function objectsOnBoardOfType(state, objectType) {
  const objects = _.pickBy(allObjectsOnBoard(state), obj => obj.card.type == objectType);
  return _.mapValues(objects, obj => obj.card.name);
}

export function playObject(state, playerName, cardName, hex) {
  const card = _.find(deck, card => card.name == cardName);
  const player = state.players[playerName];

  // We don't care about testing card draw and energy here, so ensure that:
  //    1. It's the player's turn.
  //    2. The player has the card as the first card in their hand.
  //    3. The player has enough energy to play the card.
  state.currentTurn = playerName;
  player.hand = [card].concat(player.hand);
  player.energy.available += card.cost;

  return game(state, [
    actions.setSelectedCard(0),
    actions.placeCard(hex, card)
  ]);
}
