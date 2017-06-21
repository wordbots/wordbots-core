import { filter, findIndex, findKey, sample, shuffle, times } from 'lodash';

import { TYPE_ROBOT, TYPE_EVENT, ORANGE_CORE_HEX } from '../../../constants';
import { id } from '../../../util/common';
import {
  validPlacementHexes, validMovementHexes, validAttackHexes, intermediateMoveHexId,
  newGame, passTurn
} from '../../../util/game';
import * as builtinCards from '../../../store/cards';
import HexUtils from '../../../components/react-hexgrid/HexUtils';

import { setSelectedCard, placeCard } from './cards';
import { moveRobot, attack } from './board';

export function startPractice(state, deck) {
  const decks = {
    orange: deck,
    blue: shuffle(aiDeck).map(card => ({ ...card, id: id() }))
  };

  state = newGame(state, 'orange', {orange: 'Human', blue: 'Computer'}, decks);
  state.practice = true;

  return state;
}

export function aiResponse(state) {
  if (state.usernames[state.currentTurn] !== 'Computer') {
    return state;
  }

  const ai = state.players[state.currentTurn];
  const cards = availableCards(state, ai);
  const robots = availableRobots(state, ai);

  if ((cards.length === 0 && robots.length === 0) || Math.random() < 0.05) {
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

function moveARobot(state) {
  const ai = state.players[state.currentTurn];
  const robots = availableRobots(state, ai);

  if (robots.length > 0 && Math.random() > 0.1) {  // (10% chance a given robot does nothing.)
    const robot = sample(robots);
    const robotHexId = findKey(ai.robotsOnBoard, {id: robot.id});
    const robotHex = HexUtils.IDToHex(robotHexId);

    const moveHexIds = validMovementHexes(state, robotHex).map(HexUtils.getID);
    const attackHexIds = validAttackHexes(state, robotHex).map(HexUtils.getID);
    const targetHexIds = moveHexIds.concat(attackHexIds);

    if (attackHexIds.includes(ORANGE_CORE_HEX)) {
      // Prioritize attacking the orange core above all else.
      state = moveAndAttack(state, robotHexId, ORANGE_CORE_HEX);
    } else if (targetHexIds.length > 0) {
      // Prefer hexes closer to the orange core.
      const hexDistribution = targetHexIds.reduce((acc, hex) => [acc, ...times(priority(hex), () => hex)], []);
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
  const intermediateHexId = intermediateMoveHexId(state, HexUtils.IDToHex(sourceHexId), HexUtils.IDToHex(targetHexId));

  if (intermediateHexId) {
    state = moveRobot(state, sourceHexId, intermediateHexId);
    state = attack(state, intermediateHexId, targetHexId);
  } else {
    state = attack(state, sourceHexId, targetHexId);
  }

  return state;
}

function priority(hex) {
  return (7 - HexUtils.distance(hex, HexUtils.IDToHex(ORANGE_CORE_HEX))) * 3;
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
