export const MOVE_ROBOT = 'MOVE_ROBOT';
export const PLACE_CARD = 'PLACE_CARD';
export const START_TURN = 'START_TURN';
export const END_TURN = 'END_TURN';
export const SET_SELECTED_CARD = 'SET_SELECTED_CARD';
export const SET_SELECTED_TILE = 'SET_SELECTED_TILE';
export const SET_HOVERED_CARD = 'SET_HOVERED_CARD';

export function moveRobot(fromHexId, toHexId) {
  return {
    type: MOVE_ROBOT,
    payload: {
      from: fromHexId,
      to: toHexId
    }
  }
}

export function placeCard(tile, card) {
  return {
    type: PLACE_CARD,
    payload: {
      tile: tile,
      card: card
    }
  }
}

export function passTurn() {
  return [
    {
      type: END_TURN,
      payload: {}
    },
    {
      type: START_TURN,
      payload: {}
    }
  ]
}

export function setSelectedCard(cardId) {
  return {
    type: SET_SELECTED_CARD,
    payload: {
      selectedCard: cardId
    }
  }
}

export function setSelectedTile(hexId) {
  return {
    type: SET_SELECTED_TILE,
    payload: {
      selectedTile: hexId
    }
  }
}

export function setHoveredCard(card) {
  return {
    type: SET_HOVERED_CARD,
    payload: {
      hoveredCard: card
    }
  }
}
