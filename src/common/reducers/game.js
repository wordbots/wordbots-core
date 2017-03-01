import { isArray, reduce } from 'lodash';

import defaultState, { player } from '../store/defaultGameState';
import { blueCoreCard, orangeCoreCard } from '../store/cards';
import * as creatorActions from '../actions/creator';
import * as gameActions from '../actions/game';
import { createCardFromProps } from '../util';

import g from './handlers/game';

export default function game(oldState = defaultState, action) {
  const state = Object.assign({}, oldState);

  if (isArray(action)) {
    // Allow multiple dispatch - this is primarily useful for simplifying testing.
    return reduce(action, game, state);
  } else {
    // console.log(action);
    switch (action.type) {
      case gameActions.MOVE_ROBOT:
        return g.moveRobot(state, action.payload.from, action.payload.to, action.payload.asPartOfAttack);

      case gameActions.ATTACK:
        return g.attack(state, action.payload.source, action.payload.target);

      case gameActions.PLACE_CARD:
        return g.placeCard(state, action.payload.card, action.payload.tile);

      case gameActions.END_TURN:
        return g.endTurn(state);

      case gameActions.START_TURN:
        return g.startTurn(state);

      case gameActions.SET_SELECTED_CARD:
        return g.setSelectedCard(state, action.payload.selectedCard);

      case gameActions.SET_SELECTED_TILE:
        return g.setSelectedTile(state, action.payload.selectedTile);

      case gameActions.SET_HOVERED_CARD:
        return g.setHoveredCard(state, action.payload.hoveredCard);

      case creatorActions.ADD_TO_COLLECTION: {
        const card = createCardFromProps(action.payload);
        const collection = [card].concat(state.players.orange.collection);  // Treat both players' collection as the same for now.

        state.players.blue = player('blue', collection, blueCoreCard, '-4,0,4');
        state.players.orange = player('orange', collection, orangeCoreCard, '4,0,-4');

        // Completely reset game state.
        state.currentTurn = 'orange';
        state.selectedTile = null,
        state.selectedCard = null,
        state.playingCardType = null,
        state.hoveredCard = null,
        state.status = {
          message: '',
          type: ''
        };
        state.target = {
          choosing: false,
          chosen: null,
          possibleCards: [],
          possibleHexes: []
        };
        state.winner = null;

        return state;
      }

      default:
        return state;
    }
  }
}
