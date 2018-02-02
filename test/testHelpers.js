import { cloneDeep, findIndex, forOwn, has, isArray, isObject, mapValues, pickBy } from 'lodash';

import { BLUE_CORE_HEX, ORANGE_CORE_HEX } from '../src/common/constants';
import {
  opponent, allObjectsOnBoard, ownerOf, getAttribute, validPlacementHexes,
  drawCards, applyAbilities
} from '../src/common/util/game';
import { instantiateCard } from '../src/common/util/cards';
import game from '../src/common/reducers/game';
import * as gameActions from '../src/common/actions/game';
import * as socketActions from '../src/common/actions/socket';
import { collection } from '../src/common/store/cards';
import defaultGameState from '../src/common/store/defaultGameState';
import defaultCreatorState from '../src/common/store/defaultCreatorState';
import defaultCollectionState from '../src/common/store/defaultCollectionState';
import defaultSocketState from '../src/common/store/defaultSocketState';
import { transportObject } from '../src/common/reducers/handlers/game/board';
import HexUtils from '../src/common/components/hexgrid/HexUtils';

import { attackBotCard } from './data/cards';

export function getDefaultState() {
  const state = cloneDeep(defaultGameState);
  const deck = [instantiateCard(attackBotCard)].concat(collection);
  const simulatedGameStartAction = {type: socketActions.GAME_START, payload: {decks: {orange: deck, blue: deck}}};
  return game(state, simulatedGameStartAction);
}

export function combineState(gameState = defaultGameState) {
  return {
    global: {},
    game: gameState,
    creator: defaultCreatorState,
    collection: defaultCollectionState,
    socket: defaultSocketState
  };
}

export function objectsOnBoardOfType(state, objectType) {
  const objects = pickBy(allObjectsOnBoard(state), {card: {type: objectType}});
  return mapValues(objects, 'card.name');
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
    return game(state, [gameActions.passTurn(playerName), gameActions.passTurn(opponent(playerName))]);
  } else {
    // Pass once.
    return game(state, gameActions.passTurn(state.currentTurn));
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
      gameActions.setSelectedCard(0, playerName),
      gameActions.placeCard(hex, 0),
      gameActions.setSelectedTile(target.hex, playerName)
    ]);
  } else if (target && target.card) {
    const cardIdx = findIndex(player.hand, ['name', target.card.name]);
    return game(state, [
      gameActions.setSelectedCard(0, playerName),
      gameActions.placeCard(hex, 0),
      gameActions.setSelectedCard(cardIdx, playerName)
    ]);
  } else {
    return game(state, [
      gameActions.setSelectedCard(0, playerName),
      gameActions.placeCard(hex, 0)
    ]);
  }
}

export function playEvent(state, playerName, card, targets = [{hex: '0,0,0'}]) {
  // (Target the center hex by default for global events.)

  if (!isArray(targets)) {
    targets = [targets];
  }

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

  state = game(state, gameActions.setSelectedCard(0, playerName));

  targets.forEach(target => {
    if (target.hex) {
      state = game(state, gameActions.setSelectedTile(target.hex, playerName));
    } else if (has(target, 'card')) {
      const cardIdx = isObject(target.card) ? findIndex(player.hand, ['name', target.card.name]) : target.card;
      state = game(state, gameActions.setSelectedCard(cardIdx, playerName));
    }
  });

  return state;
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
    gameActions.setSelectedTile(fromHex, state.currentTurn),
    gameActions.moveRobot(fromHex, toHex)
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
    gameActions.setSelectedTile(source, state.currentTurn),
    gameActions.attack(source, target),
    gameActions.attackComplete()
  ]);
}

export function activate(state, hex, abilityIdx, target = null, asNewTurn = false) {
  const player = ownerOf(state, allObjectsOnBoard(state)[hex]);

  if (asNewTurn) {
    state = newTurn(state, player.name);
  }

  if (target && target.hex) {
    return game(state, [
      gameActions.setSelectedTile(hex, player.name),
      gameActions.activateObject(abilityIdx),
      gameActions.setSelectedTile(target.hex, player.name)
    ]);
  } else if (target && has(target, 'card')) {
    const cardIdx = isObject(target.card) ? findIndex(player.hand, ['name', target.card.name]) : target.card;
    return game(state, [
      gameActions.setSelectedTile(hex, player.name),
      gameActions.activateObject(abilityIdx),
      gameActions.setSelectedCard(cardIdx, player.name)
    ]);
  } else {
    return game(state, [
      gameActions.setSelectedTile(hex, player.name),
      gameActions.activateObject(abilityIdx)
    ]);
  }
}

export function setUpBoardState(players) {
  let state = getDefaultState();

  ['blue', 'orange'].forEach(playerName => {
    if (players[playerName]) {
      forOwn(players[playerName], (card, hex) => {
        const placementHex = HexUtils.getID(validPlacementHexes(state, playerName, card.type)[0]);
        state = playObject(state, playerName, card, placementHex);
        state = transportObject(state, placementHex, hex);
      });
    }
  });

  state = applyAbilities(state);

  return state;
}
