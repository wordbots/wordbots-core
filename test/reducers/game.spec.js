import * as actions from '../../src/common/actions/game';
import game from '../../src/common/reducers/game';
import defaultState from '../../src/common/store/defaultState';
import { deck } from '../../src/common/store/cards';
import { TYPE_ROBOT, TYPE_STRUCTURE } from '../../src/common/constants';
import { allObjectsOnBoard } from '../../src/common/util';

function playObject(state, playerName, cardName, hex) {
  const card = _.find(deck, card => card.name == cardName);
  const player = state.players[playerName];

  // Make the chosen card be the first card in the player's hand,
  // and ensure that the player has enough energy to play it.
  player.hand = [card].concat(player.hand);
  player.energy.available += card.cost;

  if (state.currentTurn != playerName) {
    state = game(state, actions.passTurn());
  }

  state = game(state, actions.setSelectedCard(0));
  state = game(state, actions.placeCard(hex, card));
  return state;
}

function objectsOnBoardOfType(state, objectType) {
  const objects = _.pickBy(allObjectsOnBoard(state), obj => obj.card.type == objectType);
  return _.mapValues(objects, obj => obj.card.name);
}

describe('Game reducer', () => {
  it('should return the initial state', () => {
    expect(game(undefined, {})).toEqual(defaultState);
  });

  it('should be able to play robots and structures', () => {
    let state = defaultState;

    // Play an Attack Bot to 3,0,-3, by the orange core.
    state = playObject(state, 'orange', 'Attack Bot', '3,0,-3');
    expect(
      objectsOnBoardOfType(state, TYPE_ROBOT)
    ).toEqual({'3,0,-3': 'Attack Bot'});

    // Can't play a robot far from core.
    state = playObject(state, 'orange', 'Attack Bot', '2,0,-2');
    expect(
      objectsOnBoardOfType(state, TYPE_ROBOT)
    ).toEqual({'3,0,-3': 'Attack Bot'});

    // Can't play a robot on an existing location.
    state = playObject(state, 'orange', 'Attack Bot', '3,0,-3');
    expect(
      objectsOnBoardOfType(state, TYPE_ROBOT)
    ).toEqual({'3,0,-3': 'Attack Bot'});

    // Can play a structure adjacent to a robot.
    state = playObject(state, 'orange', 'Fortification', '2,0,-2');
    expect(
      objectsOnBoardOfType(state, TYPE_STRUCTURE)
    ).toEqual({'2,0,-2': 'Fortification'});
    state = playObject(state, 'orange', 'Fortification', '0,0,0');
    expect(
      objectsOnBoardOfType(state, TYPE_STRUCTURE)
    ).toEqual({'2,0,-2': 'Fortification'});

    // Can't play a structure on an existing location.
    state = playObject(state, 'orange', 'Fortification', '2,0,-2');
    expect(
      objectsOnBoardOfType(state, TYPE_STRUCTURE)
    ).toEqual({'2,0,-2': 'Fortification'});
  });
});
