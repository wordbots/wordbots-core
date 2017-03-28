import game from '../src/common/reducers/game';
import * as actions from '../src/common/actions/game';
import { collection, attackBotCard } from '../src/common/store/cards';
import defaultState from '../src/common/store/defaultGameState';
import { instantiateCard } from '../src/common/util/common';
import { allObjectsOnBoard, ownerOf, getAttribute, drawCards } from '../src/common/util/game';
import { transportObject } from '../src/common/reducers/handlers/game/board';

export function getDefaultState() {
  const state = _.cloneDeep(defaultState);
  const deck = [attackBotCard].concat(collection);
  return game(state, actions.startGame({orange: deck, blue: deck}));
}

export function objectsOnBoardOfType(state, objectType) {
  const objects = _.pickBy(allObjectsOnBoard(state), obj => obj.card.type === objectType);
  return _.mapValues(objects, obj => obj.card.name);
}

export function queryObjectAttribute(state, hex, attr) {
  return getAttribute(allObjectsOnBoard(state)[hex], attr);
}

export function queryRobotAttributes(state, hex) {
  return [
    getAttribute(allObjectsOnBoard(state)[hex], 'attack'),
    getAttribute(allObjectsOnBoard(state)[hex], 'speed'),
    getAttribute(allObjectsOnBoard(state)[hex], 'health')
  ].join('/');
}

export function queryPlayerHealth(state, playerName) {
  return queryObjectAttribute(state, {'blue': '-4,0,4', 'orange': '4,0,-4'}[playerName], 'health');
}

export function drawCardToHand(state, playerName, card) {
  const player = state.players[playerName];
  player.deck = [instantiateCard(card)].concat(player.deck);
  return drawCards(state, player, 1);
}

export function newTurn(state, playerName) {
  if (state.currentTurn === playerName) {
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
  state.player = playerName;
  player.hand = [card].concat(player.hand);
  player.energy.available += card.cost;

  if (target && target.hex) {
    return game(state, [
      actions.setSelectedCard(0),
      actions.placeCard(hex, card),
      actions.setSelectedTile(target.hex)
    ]);
  } else if (target && target.card) {
    const cardIdx = _.findIndex(player.hand, c => c.name === target.card.name);
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
  state.player = playerName;
  player.hand = [card].concat(player.hand);
  player.energy.available += card.cost;

  if (target && target.hex) {
    return game(state, [
      actions.setSelectedCard(0),
      actions.setSelectedCard(0),
      actions.setSelectedTile(target.hex)
    ]);
  } else if (target && target.card) {
    const cardIdx = _.findIndex(player.hand, c => c.name === target.card.name);
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

export function moveRobot(state, fromHex, toHex, asNewTurn = false) {
  if (asNewTurn) {
    const owner = ownerOf(state, allObjectsOnBoard(state)[fromHex]).name;
    state = newTurn(state, owner);
  }

  if (!state.players[state.currentTurn].robotsOnBoard[fromHex]) {
    throw `No ${state.currentTurn} robot on ${fromHex}!`;
  }

  return game(state, [
    actions.setSelectedTile(fromHex),
    actions.moveRobot(fromHex, toHex)
  ]);
}

export function attack(state, source, target, asNewTurn = false) {
  if (asNewTurn) {
    const owner = ownerOf(state, allObjectsOnBoard(state)[source]).name;
    state = newTurn(state, owner);
  }

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

  function placeObjects(playerName, placementHex) {
    if (players[playerName]) {
      _.forOwn(players[playerName], (card, hex) => {
        if (hex === '-3,0,3' || hex === '3,0,-3') {
          throw `${hex} must remain unoccupied in setUpBoardState()`;
        }

        state = playObject(state, playerName, card, placementHex);
        state = transportObject(state, placementHex, hex);
      });
    }
  }

  placeObjects('blue', '-3,0,3');
  placeObjects('orange', '3,0,-3');

  return state;
}


