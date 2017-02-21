import { TYPE_EVENT } from '../../../constants';
import {
  currentPlayer, opponentPlayer, allObjectsOnBoard, getAttribute, ownerOf,
  validMovementHexes, validAttackHexes,
  dealDamageToObjectAtHex, updateOrDeleteObjectAtHex,
  checkTriggers, applyAbilities
} from '../../../util';
import HexUtils from '../../../components/react-hexgrid/HexUtils';

import { placeCard, playEvent } from './cards';

export function setHoveredCard(state, card) {
  return _.assign(state, {hoveredCard: card});
}

export function setSelectedTile(state, tile) {
  if (state.target.choosing && state.target.possibleHexes.includes(tile) && !_.isNull(state.selectedCard)) {
    // Select target tile for event or afterPlayed trigger.
    console.log(tile);
    state.target = Object.assign({}, state.target, {
      chosen: [tile],
      choosing: false,
      possibleHexes: []
    });

    const card = state.players[state.currentTurn].hand[state.selectedCard];

    if (card.type == TYPE_EVENT) {
      return playEvent(state, state.selectedCard);
    } else {
      return placeCard(state, card, state.placementTile);
    }
  } else {
    // Toggle tile selection.
    state.selectedTile = (state.selectedTile == tile) ? null : tile;
    state.selectedCard = null;
    state.playingCardType = null;
    state.status.message = '';
    return state;
  }
}

export function moveRobot(state, fromHex, toHex, asPartOfAttack = false) {
  const player = state.players[state.currentTurn];
  const movingRobot = player.robotsOnBoard[fromHex];

  // Is the move valid?
  const validHexes = validMovementHexes(state, HexUtils.IDToHex(fromHex), movingRobot.movesLeft);
  if (validHexes.map(HexUtils.getID).includes(toHex)) {
    if (!asPartOfAttack) {
      state.selectedTile = null;
    }

    const distance = HexUtils.IDToHex(toHex).distance(HexUtils.IDToHex(fromHex));
    movingRobot.movesLeft -= distance;

    state = transportObject(state, fromHex, toHex);
    state = applyAbilities(state);
    state = updateOrDeleteObjectAtHex(state, movingRobot, toHex);
  }

  return state;
}

// Low-level "move" of an object.
function transportObject(state, fromHex, toHex) {
  const robot = allObjectsOnBoard(state)[fromHex];
  const owner = ownerOf(state, robot);

  owner.robotsOnBoard[toHex] = robot;
  delete owner.robotsOnBoard[fromHex];

  return state;
}

export function attack(state, source, target) {
  // TODO: All attacks are "melee" for now.
  // In the future, there will be ranged attacks that work differently.

  const player = currentPlayer(state);
  const opponent = opponentPlayer(state);

  const attacker = player.robotsOnBoard[source];
  const defender = opponent.robotsOnBoard[target];

  // Is the attack valid?
  const validHexes = validAttackHexes(state, player.name, HexUtils.IDToHex(source), attacker.movesLeft);
  if (validHexes.map(HexUtils.getID).includes(target)) {
    attacker.movesLeft = 0;

    state = dealDamageToObjectAtHex(state, getAttribute(defender, 'attack') || 0, source, 'combat');
    state = dealDamageToObjectAtHex(state, getAttribute(attacker, 'attack') || 0, target, 'combat');

    state = checkTriggers(state, 'afterAttack', (t => t.objects.map(o => o.id).includes(attacker.id)));

    // Move attacker to defender's space (if possible).
    if (getAttribute(defender, 'health') <= 0 && getAttribute(attacker, 'health') > 0) {
      state = transportObject(state, source, target);
    }

    state = applyAbilities(state);

    state.selectedTile = null;
  }

  return state;
}
