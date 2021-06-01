import { filter, findIndex, findKey, sample, shuffle } from 'lodash';
import * as React from 'react';

import Hex from '../../../components/hexgrid/Hex';
import HU from '../../../components/hexgrid/HexUtils';
import ToggleTooltipLink from '../../../components/ToggleTooltipLink';
import { DISABLE_AI, ORANGE_CORE_HEX, TYPE_EVENT, TYPE_ROBOT } from '../../../constants';
import * as builtinCards from '../../../store/cards';
import * as w from '../../../types';
import { isFlagSet } from '../../../util/browser';
import { assertCardVisible, instantiateCard } from '../../../util/cards';
import { convertRange, id } from '../../../util/common';
import { lookupUsername } from '../../../util/firebase';
import {
  intermediateMoveHexId, newGame, passTurn, validAttackHexes,
  validMovementHexes, validPlacementHexes
} from '../../../util/game';

import { attack, moveRobot, setSelectedTile } from './board';
import { placeCard, setSelectedCard } from './cards';

type State = w.GameState;

export function startPractice(state: State, format: w.Format, deck: w.CardInGame[]): State {
  const decks: w.PerPlayer<w.CardInGame[]> = {
    orange: deck,
    blue: shuffle(aiDeck)
  };

  state = newGame(state, 'orange', {orange: lookupUsername(), blue: 'Computer'}, decks, 0, format);
  state.practice = true;

  return state;
}

export function startSandbox(state: State, cardToTest: w.CardInStore | null = null): State {
  const decks: w.PerPlayer<w.CardInGame[]> = {
    orange: shuffle(aiDeck).map((card) => ({ ...card, id: id() })),
    blue: shuffle(aiDeck).map((card) => ({ ...card, id: id() }))
  };

  if (cardToTest) {
    // If we're entering sandbox mode to test a card, add two copies of it to the top of each deck.
    decks.orange.unshift(instantiateCard(cardToTest));
    decks.orange.unshift(instantiateCard(cardToTest));
    decks.blue.unshift(instantiateCard(cardToTest));
    decks.blue.unshift(instantiateCard(cardToTest));
  }

  state = newGame(state, 'orange', {orange: lookupUsername('Orange'), blue: lookupUsername('Blue')}, decks);
  state.sandbox = true;

  if (isFlagSet('skipTooltip:sandbox')) {
    state.tutorialSteps = [{
      tooltip: {
        hex: '-1,2,-1',
        text: [
          'Welcome to the sandbox!',
          'In this mode, you can control both players and play any card regardless of energy cost.',
          'You can also use the card selector sidebar to add any card in your collection to the top of either player\'s deck.',
          'To leave sandbox mode, click the Forfeit flag button to the right.' // TODO better UX for leaving sandbox mode
        ].join('\n'),
        backButton: <ToggleTooltipLink tooltipName="sandbox" />
      }
    }];
  }

  return state;
}

export function aiResponse(state: State): State {
  if (state.usernames[state.currentTurn] !== 'Computer') {
    return state;
  }

  const ai: w.PlayerInGameState = state.players[state.currentTurn];
  const cards: w.CardInGame[] = availableCards(state, ai);
  const robots: w.Object[] = availableRobots(state, ai);

  if (DISABLE_AI || (cards.length === 0 && robots.length === 0) || Math.random() < 0.05) {
    // Pass if there's nothing left to do + pass randomly 5% of the time.
    return passTurn(state, state.currentTurn);
  } else if (robots.length === 0) {
    return playACard(state);
  } else if (cards.length === 0) {
    return moveARobot(state);
  } else {
    return Math.random() < 0.5 ? playACard(state) : moveARobot(state);
  }
}

function playACard(state: State): State {
  const ai: w.PlayerInGameState = state.players[state.currentTurn];
  const cards: w.CardInGame[] = availableCards(state, ai);

  const card: w.CardInGame | undefined = sample(cards);
  if (card) {
    const idx = findIndex(ai.hand, {id: card.id});

    state = setSelectedCard(state, ai.color, idx);

    if (card.type === TYPE_EVENT) {
      // All events in the practice deck are global, so click anywhere on the board.
      state = setSelectedTile(state, ai.color, '0,0,0');
    } else {
      const validHexes = validPlacementHexes(state, ai.color, card.type);
      const hex: Hex | undefined = sample(validHexes);
      if (hex) {
        state = placeCard(state, idx, HU.getID(hex));
      }
    }
  }

  return state;
}

function moveARobot(state: State): State {
  const ai: w.PlayerInGameState = state.players[state.currentTurn];
  const robots: w.Object[] = availableRobots(state, ai);

  const robot: w.Object | undefined = sample(robots);
  if (robot && Math.random() > 0.1) {  // (10% chance a given robot does nothing.)
    const robotHexId: w.HexId = findKey(ai.objectsOnBoard, {id: robot.id})!;

    const moveHexIds: w.HexId[] = validMovementHexes(state, HU.IDToHex(robotHexId)).map(HU.getID);
    const attackHexIds: w.HexId[] = validAttackHexes(state, HU.IDToHex(robotHexId)).map(HU.getID);
    const targetHexIds: w.HexId[] = moveHexIds.concat(attackHexIds);

    if (attackHexIds.includes(ORANGE_CORE_HEX)) {
      // Prioritize attacking the orange kernel above all else.
      state = moveAndAttack(state, robotHexId, ORANGE_CORE_HEX);
    } else if (targetHexIds.length > 0) {
      // Prefer hexes closer to the orange kernel.
      const hexDistribution: w.HexId[] = targetHexIds.reduce((acc: w.HexId[], hex: w.HexId) =>
        acc.concat(new Array(priority(hex)).fill(hex)
      ), new Array<w.HexId>());
      const targetHexId: w.HexId = sample(hexDistribution)!;

      if (attackHexIds.includes(targetHexId)) {
        state = moveAndAttack(state, robotHexId, targetHexId);
      } else {
        state = moveRobot(state, robotHexId, targetHexId);
      }
    }
  }

  return state;
}

function moveAndAttack(state: State, sourceHexId: w.HexId, targetHexId: w.HexId): State {
  const intermediateHexId: w.HexId | null = intermediateMoveHexId(state, HU.IDToHex(sourceHexId), HU.IDToHex(targetHexId));

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
function priority(hexId: w.HexId): number {
  const distanceToPlayerKernel = HU.distance(HU.IDToHex(hexId), HU.IDToHex(ORANGE_CORE_HEX));
  return convertRange(distanceToPlayerKernel, [6, 1], [1, 16]);
}

function availableCards(state: State, ai: w.PlayerInGameState): w.CardInGame[] {
  const cards: w.CardInGame[] = ai.hand.map(assertCardVisible);
  return cards.filter((card) =>
    card.cost <= ai.energy.available &&
      (card.type === TYPE_EVENT || validPlacementHexes(state, ai.color, card.type).length > 0)
  );
}

function availableRobots(state: State, ai: w.PlayerInGameState): w.Object[] {
  return filter(ai.objectsOnBoard, (obj: w.Object, hex: w.HexId) =>
    obj.card.type === TYPE_ROBOT &&
      validMovementHexes(state, HU.IDToHex(hex)).concat(validAttackHexes(state, HU.IDToHex(hex))).length > 0
  );
}

const aiDeck: w.CardInGame[] = [
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
].map((card) => instantiateCard({ ...card, id: id() }));
