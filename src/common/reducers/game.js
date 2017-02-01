import * as gameActions from '../actions/game';
import { defaultState } from '../store/defaultState';
import { TYPE_ROBOT } from '../constants';
import ExecutionContext from './game/executionContext';

export default function game(state = defaultState, action) {
  let newState = Object.assign({}, state);

  const opponentName = state.currentTurn == 'blue' ? 'orange' : 'blue';

  let player = newState.players[state.currentTurn];
  const opponent = newState.players[opponentName];

  const context = new ExecutionContext(newState);

  switch (action.type) {
    case gameActions.MOVE_ROBOT:
      let movingRobot = player.robotsOnBoard[action.payload.from];

      if (!action.payload.asPartOfAttack) {
        movingRobot.hasMoved = true;
        newState.selectedTile = null;
      }

      delete newState.players[state.currentTurn].robotsOnBoard[action.payload.from];
      newState.players[state.currentTurn].robotsOnBoard[action.payload.to] = movingRobot;

      return newState;

    case gameActions.ATTACK:
      // TODO: All attacks are "melee" for now.
      // In the future, there will be ranged attacks that work differently.

      let attacker = player.robotsOnBoard[action.payload.source];
      let defender = opponent.robotsOnBoard[action.payload.target];

      attacker.hasMoved = true;
      attacker.stats.health -= defender.stats.attack;
      defender.stats.health -= attacker.stats.attack;

      if (attacker.stats.health <= 0) {
        delete newState.players[state.currentTurn].robotsOnBoard[action.payload.source];
      } else {
        newState.players[state.currentTurn].robotsOnBoard[action.payload.source] = attacker;
      }

      if (defender.stats.health <= 0) {
        if (defender.card.name === 'Blue Core') {
          newState.winner = 'orange';
        } else if (defender.card.name === 'Orange Core') {
          newState.winner = 'blue';
        }

        delete newState.players[opponentName].robotsOnBoard[action.payload.target];

        if (attacker.stats.health > 0) {
          // Move attacker to defender's space.
          newState.players[state.currentTurn].robotsOnBoard[action.payload.target] = attacker;
          delete newState.players[state.currentTurn].robotsOnBoard[action.payload.source];
        }
      } else {
        newState.players[opponentName].robotsOnBoard[action.payload.target] = defender;
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
      newState.selectedTile = null;
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
        // Deselect or play event
        if (selectedCard.type === TYPE_ROBOT) {
          newState.players[state.currentTurn].selectedCard = null;
          newState.placingRobot = false;
          newState.status.message = '';
        } else {
          newState = context.execute(selectedCard.command);

          player = newState.players[state.currentTurn];

          player.selectedCard = null;
          player.energy.used += selectedCard.cost;
          player.hand.splice(action.payload.selectedCard, 1);

          newState.playingCard = false;
          newState.status.message = '';
        }
      } else {
        // Select
        newState.players[state.currentTurn].selectedCard = action.payload.selectedCard;

        if (selectedCard.cost <= energy.total - energy.used) {
          if (selectedCard.type === TYPE_ROBOT) {
            newState.placingRobot = true;
            newState.playingCard = false;
            newState.status.message = 'Select an available tile to place this robot.';
            newState.status.type = 'text';
          } else {
            newState.placingRobot = false;
            newState.playingCard = true;
            newState.status.message = 'Select this card again to play it as an event.';
            newState.status.type = 'text';
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

    case gameActions.SET_HOVERED_CARD:
      newState.hoveredCard = action.payload.hoveredCard;
      return newState;

    case gameActions.EXECUTE_COMMAND:
      return context.execute(action.payload.cmd);

    default:
      return state;
  }
}
