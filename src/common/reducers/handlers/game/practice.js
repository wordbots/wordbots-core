import { cloneDeep, filter, findIndex, findKey, sample, shuffle, times } from 'lodash';

import { TYPE_ROBOT, TYPE_EVENT } from '../../../constants';
import { id } from '../../../util/common';
import {
  validPlacementHexes, validMovementHexes, validAttackHexes, intermediateMoveHexId,
  passTurn
} from '../../../util/game';
import * as builtinCards from '../../../store/cards';
import defaultState from '../../../store/defaultGameState';
import HexUtils from '../../../components/react-hexgrid/HexUtils';

import { setSelectedCard, placeCard } from './cards';
import { moveRobot, attack } from './board';

export function startPractice(state) {
  // Reset game state and enable practice mode.
  state = Object.assign(state, cloneDeep(defaultState), {
    started: true,
    practice: true,
    usernames: {orange: 'Human', blue: 'Computer'}
  });

  // Set up.
  const orangeDeck = shuffle(builtinCards.collection).slice(0, 30).map(card => Object.assign({}, card, {id: id()}));
  const blueDeck = shuffle(aiDeck).map(card => Object.assign({}, card, {id: id()}));

  state.players.orange.hand = orangeDeck.slice(0, 2);
  state.players.orange.deck = orangeDeck.slice(2);
  state.players.blue.hand = blueDeck.slice(0, 2);
  state.players.blue.deck = blueDeck.slice(2);

  return state;
}

export function aiResponse(state) {
  if (state.usernames[state.currentTurn] !== 'Computer') {
    return state;
  }

  const rnd = Math.random();

  const ai = state.players[state.currentTurn];
  const cards = availableCards(state, ai);
  const robots = availableRobots(state, ai);

  if (rnd < 0.05 || (cards.length === 0 && robots.length === 0)) {
    return passTurn(state, state.currentTurn);
  } else if (rnd < 0.50 || robots.length === 0) {
    return tryToPlayCard(state);
  } else {
    return tryToMoveRobot(state);
  }
}

function tryToPlayCard(state) {
  const ai = state.players[state.currentTurn];
  const cards = availableCards(state, ai);

  if (cards.length > 0) {
    const card = sample(cards);
    const idx = findIndex(ai.hand, {id: card.id});

    state = setSelectedCard(state, ai.name, idx);

    if (card.type === TYPE_EVENT) {
      // Play event by "clicking twice".
      state = setSelectedCard(state, ai.name, idx);
    } else {
      const validHexes = validPlacementHexes(state, ai.name, card.type);
      if (validHexes.length > 0) {
        state = placeCard(state, idx, HexUtils.getID(sample(validHexes)));
      }
    }
  }

  return state;
}

function tryToMoveRobot(state) {
  const ai = state.players[state.currentTurn];
  const robots = availableRobots(state, ai);

  const orangeCoreHexId = '3,0,-3';
  const orangeCoreHex = HexUtils.IDToHex(orangeCoreHexId);

  if (robots.length > 0) {
    const robot = sample(robots);
    const hex = HexUtils.IDToHex(findKey(ai.robotsOnBoard, {id: robot.id}));

    const moveHexes = validMovementHexes(state, hex);
    const attackHexes = validAttackHexes(state, hex);

    if (attackHexes.map(HexUtils.getID).includes(orangeCoreHexId)) {
      const intermediateHex = intermediateMoveHexId(state, hex, orangeCoreHex);

      if (intermediateHex) {
        state = moveRobot(state, HexUtils.getID(hex), intermediateHex);
        state = attack(state, intermediateHex, orangeCoreHexId);
      } else {
        state = attack(state, HexUtils.getID(hex), orangeCoreHexId);
      }
    } else if (moveHexes.length > 0) {
      const moveDistribution = [];
      moveHexes.forEach(moveHex => {
        const weight = (7 - HexUtils.distance(moveHex, orangeCoreHex)) * 3;
        moveDistribution.push(...times(weight, () => moveHex));
      });

      state = moveRobot(state, HexUtils.getID(hex), HexUtils.getID(sample(moveDistribution)));
    }
  }

  return state;
}

function availableCards(state, ai) {
  return ai.hand.filter(card =>
    card.cost <= ai.energy.available &&
      (card.type === TYPE_EVENT || validPlacementHexes(state, ai.name, card.type).length > 0)
  );
}

function availableRobots(state, ai) {
  return filter(ai.robotsOnBoard, (obj, hex) =>
    obj.card.type === TYPE_ROBOT &&
      validMovementHexes(state, HexUtils.IDToHex(hex)).concat(validAttackHexes(state, HexUtils.IDToHex(hex))).length > 0
  );
}

const aiDeck = [
  builtinCards.oneBotCard,
  builtinCards.oneBotCard,
  builtinCards.twoBotCard,
  builtinCards.twoBotCard,
  builtinCards.redBotCard,
  builtinCards.redBotCard,
  builtinCards.blueBotCard,
  builtinCards.blueBotCard,
  builtinCards.dojoDiscipleCard,
  builtinCards.dojoDiscipleCard,
  builtinCards.concentrationCard,
  builtinCards.concentrationCard,
  builtinCards.arenaCard,
  builtinCards.fortificationCard,
  builtinCards.martyrBotCard,
  builtinCards.superchargeCard,
  builtinCards.recruiterBotCard,
  builtinCards.earthquakeCard,
  builtinCards.defenderBotCard,
  builtinCards.threedomCard,
  builtinCards.monkeyBotCard,
  builtinCards.generalBotCard,
  builtinCards.wisdomCard,
  builtinCards.discountCard,
  builtinCards.missileStrikeCard,
  builtinCards.rampageCard,
  builtinCards.antiGravityFieldCard,
  builtinCards.thornyBushCard,
  builtinCards.leapFrogBotCard,
  builtinCards.friendlyRiotShieldCard
];
