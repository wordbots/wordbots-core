import game from '../src/common/reducers/game';
import * as actions from '../src/common/actions/game';
import defaultState from '../src/common/store/defaultState';
import { instantiateCard, allObjectsOnBoard } from '../src/common/util';
import { transportObject } from '../src/common/reducers/handlers/game/board';

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
  card = instantiateCard(card);
  state.currentTurn = playerName;
  player.hand = [card].concat(player.hand);
  player.energy.available += card.cost;

  if (target && target.hex) {
    return game(state, [
      actions.setSelectedCard(0),
      actions.placeCard(hex, card),
      actions.setSelectedTile(target.hex)
    ]);
  } else if (target && target.card) {
    const cardIdx = _.findIndex(player.hand, c => c.name == target.card.name);
    return game(state, [
      actions.setSelectedCard(0),
      actions.placeCard(hex, card),
      actions.setSelectedCard(cardIdx)
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
  card = instantiateCard(card);
  state.currentTurn = playerName;
  player.hand = [card].concat(player.hand);
  player.energy.available += card.cost;

  if (target && target.hex) {
    return game(state, [
      actions.setSelectedCard(0),
      actions.setSelectedCard(0),
      actions.setSelectedTile(target.hex)
    ]);
  } else if (target && target.card) {
    const cardIdx = _.findIndex(player.hand, c => c.name == target.card.name);
    return game(state, [
      actions.setSelectedCard(0),
      actions.setSelectedCard(0),
      actions.setSelectedCard(cardIdx)
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

export function setUpBoardState(players) {
  let state = getDefaultState();

  _.forOwn(players.blue, (card, hex) => {
    state = playObject(state, 'blue', card, '-3,0,3');
    state = transportObject(state, '-3,0,3', hex);
  });

  _.forOwn(players.orange, (card, hex) => {
    state = playObject(state, 'orange', card, '3,0,-3');
    state = transportObject(state, '3,0,-3', hex);
  });

  return state;
}


