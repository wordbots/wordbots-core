export const START_GAME = 'START_GAME';
export const NEW_GAME = 'NEW_GAME';
export const MOVE_ROBOT = 'MOVE_ROBOT';
export const ATTACK = 'ATTACK';
export const MOVE_ROBOT_AND_ATTACK = 'MOVE_ROBOT_AND_ATTACK';
export const PLACE_CARD = 'PLACE_CARD';
export const PASS_TURN = 'PASS_TURN';
export const SET_SELECTED_CARD = 'SET_SELECTED_CARD';
export const SET_SELECTED_TILE = 'SET_SELECTED_TILE';
export const SET_HOVERED_CARD = 'SET_HOVERED_CARD';
export const SET_HOVERED_TILE = 'SET_HOVERED_TILE';

export function startGame(decks) {
  return {
    type: START_GAME,
    payload: {
      decks: decks
    }
  };
}

export function newGame() {
  return {
    type: NEW_GAME
  };
}

export function moveRobot(fromHexId, toHexId) {
  return {
    type: MOVE_ROBOT,
    payload: {
      from: fromHexId,
      to: toHexId
    }
  };
}

export function attack(sourceHexId, targetHexId) {
  return {
    type: ATTACK,
    payload: {
      source: sourceHexId,
      target: targetHexId
    }
  };
}

export function moveRobotAndAttack(fromHexId, toHexId, targetHexId) {
  return {
    type: MOVE_ROBOT_AND_ATTACK,
    payload: {
      from: fromHexId,
      to: toHexId,
      target: targetHexId
    }
  };
}

export function placeCard(tile, card) {
  return {
    type: PLACE_CARD,
    payload: {
      tile: tile,
      card: card
    }
  };
}

export function passTurn() {
  return {
    type: PASS_TURN,
    payload: {}
  };
}

export function setSelectedCard(cardId, player) {
  return {
    type: SET_SELECTED_CARD,
    payload: {
      player: player,
      selectedCard: cardId
    }
  };
}

export function setSelectedTile(hexId, player) {
  return {
    type: SET_SELECTED_TILE,
    payload: {
      player: player,
      selectedTile: hexId
    }
  };
}

export function setHoveredCard(cardId) {
  return {
    type: SET_HOVERED_CARD,
    payload: {
      hoveredCard: cardId
    }
  };
}

export function setHoveredTile(card) {
  return {
    type: SET_HOVERED_TILE,
    payload: {
      hoveredCard: card
    }
  };
}
