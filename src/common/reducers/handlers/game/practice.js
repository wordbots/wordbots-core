import { filter, findIndex, findKey, sample, shuffle, times } from 'lodash';

import { DISABLE_AI, TYPE_ROBOT, TYPE_EVENT, ORANGE_CORE_HEX } from '../../../constants';
import { id, convertRange } from '../../../util/common';
import {
  validPlacementHexes, validMovementHexes, validAttackHexes, intermediateMoveHexId,
  newGame, passTurn
} from '../../../util/game';
import * as builtinCards from '../../../store/cards';
import HU from '../../../components/hexgrid/HexUtils';

import { setSelectedCard, placeCard } from './cards';
import { setSelectedTile, moveRobot, attack } from './board';

export function startPractice(state, deck) {
  const decks = {
    orange: deck,
    blue: shuffle(aiDeck).map(card => ({ ...card, id: id() }))
  };

  state = newGame(state, 'orange', {orange: 'Human', blue: 'Computer'}, decks);
  state.practice = true;

  return state;
}

export function startSandbox(state) {
  const decks = {
    orange: shuffle(aiDeck).map(card => ({ ...card, id: id() })),
    blue: shuffle(aiDeck).map(card => ({ ...card, id: id() }))
  };

  state = newGame(state, 'orange', {orange: 'Orange', blue: 'Blue'}, decks);
  state.sandbox = true;

  return state;
}

export function aiResponse(state) {
  if (state.usernames[state.currentTurn] !== 'Computer') {
    return state;
  }

  const ai = state.players[state.currentTurn];
  const cards = availableCards(state, ai);
  const robots = availableRobots(state, ai);

  if (DISABLE_AI || (cards.length === 0 && robots.length === 0) || Math.random() < 0.05) {
    // Pass if there's nothing left to do + pass randomly 5% of the time.
    return passTurn(state, state.currentTurn);
  } else if (robots.length === 0) {
    return playACard(state);
  } else if (cards.length === 0) {
    return moveARobot(state);
  } else {
    return Math.random() < 0.50 ? playACard(state) : moveARobot(state);
  }
}

function playACard(state) {
  const ai = state.players[state.currentTurn];
  const cards = availableCards(state, ai);

  if (cards.length > 0) {
    const card = sample(cards);
    const idx = findIndex(ai.hand, {id: card.id});

    state = setSelectedCard(state, ai.name, idx);

    if (card.type === TYPE_EVENT) {
      // All events in the practice deck are global, so click anywhere on the board.
      state = setSelectedTile(state, ai.name, '0,0,0');
    } else {
      const validHexes = validPlacementHexes(state, ai.name, card.type);
      if (validHexes.length > 0) {
        state = placeCard(state, idx, HU.getID(sample(validHexes)));
      }
    }
  }

  return state;
}

function moveARobot(state) {
  const ai = state.players[state.currentTurn];
  const robots = availableRobots(state, ai);

  if (robots.length > 0 && Math.random() > 0.1) {  // (10% chance a given robot does nothing.)
    const robot = sample(robots);
    const robotHexId = findKey(ai.robotsOnBoard, {id: robot.id});

    const moveHexIds = validMovementHexes(state, HU.IDToHex(robotHexId)).map(HU.getID);
    const attackHexIds = validAttackHexes(state, HU.IDToHex(robotHexId)).map(HU.getID);
    const targetHexIds = moveHexIds.concat(attackHexIds);

    if (attackHexIds.includes(ORANGE_CORE_HEX)) {
      // Prioritize attacking the orange kernel above all else.
      state = moveAndAttack(state, robotHexId, ORANGE_CORE_HEX);
    } else if (targetHexIds.length > 0) {
      // Prefer hexes closer to the orange kernel.
      const hexDistribution = targetHexIds.reduce((acc, hex) => acc.concat(times(priority(hex), () => hex)), []);
      const targetHexId = sample(hexDistribution);

      if (attackHexIds.includes(targetHexId)) {
        state = moveAndAttack(state, robotHexId, targetHexId);
      } else {
        state = moveRobot(state, robotHexId, targetHexId);
      }
    }
  }

  return state;
}

function moveAndAttack(state, sourceHexId, targetHexId) {
  const intermediateHexId = intermediateMoveHexId(state, HU.IDToHex(sourceHexId), HU.IDToHex(targetHexId));

  if (intermediateHexId) {
    state = moveRobot(state, sourceHexId, intermediateHexId);
    // Ignore the attack part of the move for now because it makes the animation look bad.
    // state = attack(state, intermediateHexId, targetHexId);
  } else {
    state = attack(state, sourceHexId, targetHexId);
  }

  return state;
}

// How likely a robot is to move to a given hex.
// Ranges from 1 (for hexes adjacent to the blue kernel) to 16 (for hexes adjacent to the orange kernel).
function priority(hexId) {
  const distanceToPlayerKernel = HU.distance(HU.IDToHex(hexId), HU.IDToHex(ORANGE_CORE_HEX));
  return convertRange(distanceToPlayerKernel, [6, 1], [1, 16]);
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
      validMovementHexes(state, HU.IDToHex(hex)).concat(validAttackHexes(state, HU.IDToHex(hex))).length > 0
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
  builtinCards.superchargeCard,
  builtinCards.recruiterBotCard,
  builtinCards.threedomCard,
  builtinCards.monkeyBotCard,
  builtinCards.generalBotCard,
  builtinCards.wisdomCard,
  builtinCards.discountCard,
  builtinCards.missileStrikeCard,
  builtinCards.rampageCard,
  builtinCards.rampageCard,
  builtinCards.antiGravityFieldCard,
  builtinCards.thornyBushCard,
  builtinCards.thornyBushCard,
  builtinCards.leapFrogBotCard
];
