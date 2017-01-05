export const MOVE_ROBOT = 'MOVE_ROBOT';
export const PASS_TURN = 'PASS_TURN';
export const SET_SELECTED_CARD = 'SET_SELECTED_CARD';
export const SET_SELECTED_TILE = 'SET_SELECTED_TILE';

export function moveRobot(fromHexId, toHexId) {
  return {
    type: MOVE_ROBOT,
    payload: {
      from: fromHexId,
      to: toHexId
    }
  }
}

export function passTurn() {
  return {
    type: PASS_TURN,
    payload: {}
  }
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
