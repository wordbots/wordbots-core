import game from '../../src/common/reducers/game';
import defaultState from '../../src/common/store/defaultState';
import { TYPE_ROBOT, TYPE_STRUCTURE } from '../../src/common/constants';
import { objectsOnBoardOfType, newTurn, playObject, moveRobot } from '../test_helpers';

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

  it('should be able to move robots', () => {
    let state = defaultState;
    state = playObject(state, 'orange', 'Attack Bot', '3,0,-3');

    expect(state.currentTurn).toEqual('orange');

    // Robots cannot move on the turn they are placed.
    state = moveRobot(state, '3,0,-3', '2,0,-2');
    expect(
      objectsOnBoardOfType(state, TYPE_ROBOT)
    ).toEqual({'3,0,-3': 'Attack Bot'});

    state = newTurn(state, 'orange');

    // Robots cannot move into existing objects.
    state = moveRobot(state, '3,0,-3', '4,0,-4'); // There's a kernel there!
    expect(
      objectsOnBoardOfType(state, TYPE_ROBOT)
    ).toEqual({'3,0,-3': 'Attack Bot'});

    // Robots can move up to their movement range (Attack Bot has range 2).
    state = moveRobot(state, '3,0,-3', '0,0,0'); // Try to move 3 spaces.
    expect(
      objectsOnBoardOfType(state, TYPE_ROBOT)
    ).toEqual({'3,0,-3': 'Attack Bot'});
    state = moveRobot(state, '3,0,-3', '1,0,-1'); // Move 2 spaces.
    expect(
      objectsOnBoardOfType(state, TYPE_ROBOT)
    ).toEqual({'1,0,-1': 'Attack Bot'});

    // Robots cannot move after they've exhausted their movesLeft.
    state = moveRobot(state, '1,0,-1', '0,0,0'); // Try to move 1 space.
    expect(
      objectsOnBoardOfType(state, TYPE_ROBOT)
    ).toEqual({'1,0,-1': 'Attack Bot'});

    state = newTurn(state, 'orange');

    // Robots can perform a partial move.
    state = moveRobot(state, '1,0,-1', '0,0,0'); // Move 1 space.
    state = moveRobot(state, '0,0,0', '-1,0,1'); // Move 1 space again.
    expect(
      objectsOnBoardOfType(state, TYPE_ROBOT)
    ).toEqual({'-1,0,1': 'Attack Bot'});
  });
});
