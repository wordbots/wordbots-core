import { cloneDeep, findIndex, forOwn, has, isObject, mapValues, pickBy } from 'lodash';

import { BLUE_CORE_HEX, ORANGE_CORE_HEX } from '../src/common/constants';
import { instantiateCard } from '../src/common/util/common';
import { opponent, allObjectsOnBoard, ownerOf, getAttribute, drawCards, applyAbilities } from '../src/common/util/game';
import game from '../src/common/reducers/game';
import * as actions from '../src/common/actions/game';
import { collection, attackBotCard } from '../src/common/store/cards';
import defaultGameState from '../src/common/store/defaultGameState';
import defaultCreatorState from '../src/common/store/defaultCreatorState';
import defaultCollectionState from '../src/common/store/defaultCollectionState';
import defaultSocketState from '../src/common/store/defaultSocketState';
import { transportObject } from '../src/common/reducers/handlers/game/board';

export function getDefaultState() {
  const state = cloneDeep(defaultGameState);
  const deck = [instantiateCard(attackBotCard)].concat(collection);
  return game(state, actions.startGame({orange: deck, blue: deck}));
}

export function combineState(gameState = defaultGameState) {
  return {
    game: gameState,
    creator: defaultCreatorState,
    collection: defaultCollectionState,
    socket: defaultSocketState,
    layout: {present: {}}
  };
}

export function objectsOnBoardOfType(state, objectType) {
  const objects = pickBy(allObjectsOnBoard(state), obj => obj.card.type === objectType);
  return mapValues(objects, obj => obj.card.name);
}

export function queryObjectAttribute(state, hex, attr) {
  return getAttribute(allObjectsOnBoard(state)[hex], attr);
}

export function queryRobotAttributes(state, hex) {
  return [
    getAttribute(allObjectsOnBoard(state)[hex], 'attack'),
    getAttribute(allObjectsOnBoard(state)[hex], 'health'),
    getAttribute(allObjectsOnBoard(state)[hex], 'speed')
  ].join('/');
}

export function queryPlayerHealth(state, playerName) {
  return queryObjectAttribute(state, {'blue': BLUE_CORE_HEX, 'orange': ORANGE_CORE_HEX}[playerName], 'health');
}

export function drawCardToHand(state, playerName, card) {
  const player = state.players[playerName];
  player.deck = [instantiateCard(card)].concat(player.deck);
  return drawCards(state, player, 1);
}

export function newTurn(state, playerName) {
  if (state.currentTurn === playerName) {
    // Pass twice.
    return game(state, [actions.passTurn(playerName), actions.passTurn(opponent(playerName))]);
  } else {
    // Pass once.
    return game(state, actions.passTurn(state.currentTurn));
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
      actions.setSelectedCard(0, playerName),
      actions.placeCard(hex, 0),
      actions.setSelectedTile(target.hex, playerName)
    ]);
  } else if (target && target.card) {
    const cardIdx = findIndex(player.hand, c => c.name === target.card.name);
    return game(state, [
      actions.setSelectedCard(0, playerName),
      actions.placeCard(hex, 0),
      actions.setSelectedCard(cardIdx, playerName)
    ]);
  } else {
    return game(state, [
      actions.setSelectedCard(0, playerName),
      actions.placeCard(hex, 0)
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
      actions.setSelectedCard(0, playerName),
      actions.setSelectedCard(0, playerName),
      actions.setSelectedTile(target.hex, playerName)
    ]);
  } else if (target && has(target, 'card')) {
    const cardIdx = isObject(target.card) ? findIndex(player.hand, c => c.name === target.card.name) : target.card;
    return game(state, [
      actions.setSelectedCard(0, playerName),
      actions.setSelectedCard(0, playerName),
      actions.setSelectedCard(cardIdx, playerName)
    ]);
  } else {
    return game(state, [
      actions.setSelectedCard(0, playerName),
      actions.setSelectedCard(0, playerName)
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
    actions.setSelectedTile(fromHex, state.currentTurn),
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
    actions.setSelectedTile(source, state.currentTurn),
    actions.attack(source, target)
  ]);
}

export function activate(state, hex, abilityIdx, target = null, asNewTurn = false) {
  const player = ownerOf(state, allObjectsOnBoard(state)[hex]);

  if (asNewTurn) {
    state = newTurn(state, player.name);
  }

  if (target && target.hex) {
    return game(state, [
      actions.setSelectedTile(hex, player.name),
      actions.activateObject(abilityIdx),
      actions.setSelectedTile(target.hex, player.name)
    ]);
  } else if (target && has(target, 'card')) {
    const cardIdx = isObject(target.card) ? findIndex(player.hand, c => c.name === target.card.name) : target.card;
    return game(state, [
      actions.setSelectedTile(hex, player.name),
      actions.activateObject(abilityIdx),
      actions.setSelectedCard(cardIdx, player.name)
    ]);
  } else {
    return game(state, [
      actions.setSelectedTile(hex, player.name),
      actions.activateObject(abilityIdx)
    ]);
  }
}

export function setUpBoardState(players) {
  function placeObjects(state, playerName, placementHexes) {
    if (players[playerName]) {
      forOwn(players[playerName], (card, hex) => {
        const placementHex = placementHexes.find(h => !allObjectsOnBoard(state)[h]);
        state = playObject(state, playerName, card, placementHex);
        state = transportObject(state, placementHex, hex);
      });
    }
    return state;
  }

  let state = getDefaultState();
  state = placeObjects(state, 'blue', ['-3,1,2', '-2,0-2', '-2,-1,3']);
  state = placeObjects(state, 'orange', ['3,-1,-2', '2,0,-2', '2,1,-3']);
  state = applyAbilities(state);

  return state;
}
