export const SET_SELECTED_CARD = 'SET_SELECTED_CARD';

export function setSelectedCard(cardId) {
  return {
    type: SET_SELECTED_CARD,
    payload: {
      selectedCard: cardId
    }
  }
}
