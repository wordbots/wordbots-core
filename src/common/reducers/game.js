import * as gameActions from '../actions/game';
import { defaultState } from '../store/defaultState';

export default function game(state = defaultState, action) {
  let newState = Object.assign({}, state);

  const opponentName = state.currentTurn == 'blue' ? 'orange' : 'blue';

  const player = newState.players[state.currentTurn];
  const opponent = newState.players[opponentName];

  switch (action.type) {
    case gameActions.MOVE_ROBOT:
      let movingRobot = player.robotsOnBoard[action.payload.from];
      movingRobot.hasMoved = true;

      newState.selectedTile = null;
      delete newState.players[state.currentTurn].robotsOnBoard[action.payload.from];
      newState.players[state.currentTurn].robotsOnBoard[action.payload.to] = movingRobot;

      return newState;

    case gameActions.ATTACK:
      const attacker = player.robotsOnBoard[action.payload.source];
      let target = opponent.robotsOnBoard[action.payload.target];

      target.stats.health -= attacker.stats.attack;
      if (target.stats.health <= 0) {
        delete newState.players[opponentName].robotsOnBoard[action.payload.target];
      } else {
        newState.players[opponentName].robotsOnBoard[action.payload.target] = target;
      }

      newState.selectedTile = null;

      return newState;

    case gameActions.PLACE_CARD:
      let selectedCardIndex = newState.players[state.currentTurn].selectedCard;

      player.robotsOnBoard[action.payload.tile] = {
        hasMoved: true,
        card: action.payload.card,
        stats: action.payload.card.stats
      }

      player.selectedCard = null;
      player.energy.used += player.hand[selectedCardIndex].cost;
      player.hand.splice(selectedCardIndex, 1);

      newState.placingRobot = false;
      newState.status.message = '';

      return newState;

    case gameActions.END_TURN:
      newState.currentTurn = (state.currentTurn == 'blue' ? 'orange' : 'blue');

      player.selectedCard = null;
      newState.placingRobot = false;
      newState.status.message = '';

      return newState;

    case gameActions.START_TURN:
      player.energy.total += 1;
      player.energy.used = 0;
      player.hand = player.hand.concat(player.deck.splice(0, 1));
      Object.keys(player.robotsOnBoard).forEach((hex) => player.robotsOnBoard[hex].hasMoved = false);

      return newState;

    case gameActions.SET_SELECTED_CARD:
      let selectedCard = newState.players[state.currentTurn].hand[action.payload.selectedCard];
      let energy = newState.players[state.currentTurn].energy;

      newState.selectedTile = null;

      if (newState.players[state.currentTurn].selectedCard == action.payload.selectedCard) {
        // Deselect
        newState.players[state.currentTurn].selectedCard = null;
        newState.placingRobot = false;
        newState.status.message = '';
      } else {
        // Select
        newState.players[state.currentTurn].selectedCard = action.payload.selectedCard;

        if (selectedCard.cost <= energy.total - energy.used) {
          if (selectedCard.type === 0) {
            newState.placingRobot = true;
            newState.status.message = 'Select an available tile to place this robot.';
            newState.status.type = 'text';
          } else {
            // Playing spell logic
            newState.placingRobot = false;
            newState.status.message = '';
          }
        } else {
          newState.placingRobot = false;
          newState.status.message = 'You do not have enough energy to play this card.';
          newState.status.type = 'error';
        }
      }

      return newState;

    case gameActions.SET_SELECTED_TILE:
      newState.players[state.currentTurn].selectedCard = null;
      newState.placingRobot = false;
      newState.status.message = '';

      if (newState.selectedTile == action.payload.selectedTile) {
        // Deselect
        newState.selectedTile = null;
      } else {
        // Select
        newState.selectedTile = action.payload.selectedTile;
      }

      return newState;

    default:
      return state;
  }
}
