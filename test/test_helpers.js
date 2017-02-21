import game from '../src/common/reducers/game';
import * as actions from '../src/common/actions/game';
import defaultState from '../src/common/store/defaultState';
import { allObjectsOnBoard } from '../src/common/util';

function instantiateCard(card) {
  return Object.assign({}, card, {
    id: 'card_' + _.uniqueId(),
    baseCost: card.cost
  });
}

export function getDefaultState() {
  return _.cloneDeep(defaultState);
}

export function objectsOnBoardOfType(state, objectType) {
  const objects = _.pickBy(allObjectsOnBoard(state), obj => obj.card.type == objectType);
  return _.mapValues(objects, obj => obj.card.name);
}

export function drawCardToHand(state, playerName, card) {
  const player = state.players[playerName];
  player.hand = [instantiateCard(card)].concat(player.hand);
  return state;
}

export function newTurn(state, playerName) {
  if (state.currentTurn == playerName) {
    // Pass twice.
    return game(state, [actions.passTurn(), actions.passTurn()]);
  } else {
    // Pass once.
    return game(state, actions.passTurn());
  }
}

export function playObject(state, playerName, card, hex, target = null) {
  const player = state.players[playerName];

  // We don't care about testing card draw and energy here, so ensure that:
  //    1. It's the player's turn.
  //    2. The player has the card as the first card in their hand.
  //    3. The player has enough energy to play the card.
  state.currentTurn = playerName;
  player.hand = [instantiateCard(card)].concat(player.hand);
  player.energy.available += card.cost;

  if (target && target.hex) {
    return game(state, [
      actions.setSelectedCard(0),
      actions.placeCard(hex, card),
      actions.setSelectedTile(target.hex)
    ]);
  } else if (target && target.card) {
    return game(state, [
      actions.setSelectedCard(0),
      actions.placeCard(hex, card),
      actions.setSelectedCard(_.findIndex(player.hand, c => c.name == target.card.name))
    ]);
  } else {
    return game(state, [
      actions.setSelectedCard(0),
      actions.placeCard(hex, card)
    ]);
  }
}

export function playEvent(state, playerName, card, target = null) {
  const player = state.players[playerName];

  // We don't care about testing card draw and energy here, so ensure that:
  //    1. It's the player's turn.
  //    2. The player has the card as the first card in their hand.
  //    3. The player has enough energy to play the card.
  state.currentTurn = playerName;
  player.hand = [instantiateCard(card)].concat(player.hand);
  player.energy.available += card.cost;

  if (target && target.hex) {
    return game(state, [
      actions.setSelectedCard(0),
      actions.setSelectedCard(0),
      actions.setSelectedTile(target.hex)
    ]);
  } else if (target && target.card) {
    return game(state, [
      actions.setSelectedCard(0),
      actions.setSelectedCard(0),
      actions.setSelectedCard(_.findIndex(player.hand, c => c.name == target.card.name))
    ]);
  } else {
    return game(state, [
      actions.setSelectedCard(0),
      actions.setSelectedCard(0)
    ]);
  }
}

export function moveRobot(state, fromHex, toHex) {
  if (!state.players[state.currentTurn].robotsOnBoard[fromHex]) {
    throw `No ${state.currentTurn} robot on ${fromHex}!`;
  }

  return game(state, [
    actions.setSelectedTile(fromHex),
    actions.moveRobot(fromHex, toHex)
  ]);
}

export function attack(state, source, target) {
  if (!state.players[state.currentTurn].robotsOnBoard[source]) {
    throw `No ${state.currentTurn} robot on ${source}!`;
  }

  return game(state, [
    actions.setSelectedTile(source),
    actions.attack(source, target)
  ]);
}
