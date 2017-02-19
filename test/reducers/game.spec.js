import game from '../../src/common/reducers/game';
import defaultState from '../../src/common/store/defaultState';
import * as cards from '../../src/common/store/cards';
import { TYPE_ROBOT, TYPE_STRUCTURE } from '../../src/common/constants';
import { objectsOnBoardOfType, newTurn, playObject, playEvent, moveRobot, attack } from '../test_helpers';

describe('Game reducer', () => {
  it('should return the initial state', () => {
    expect(game(undefined, {})).toEqual(defaultState);
  });

  it('should be able to play robots and structures', () => {
    let state = defaultState;

    // Play an Attack Bot to 3,0,-3, by the orange core.
    state = playObject(state, 'orange', cards.attackBotCard, '3,0,-3');
    expect(
      objectsOnBoardOfType(state, TYPE_ROBOT)
    ).toEqual({'3,0,-3': 'Attack Bot'});

    // Can't play a robot far from core.
    state = playObject(state, 'orange', cards.attackBotCard, '2,0,-2');
    expect(
      objectsOnBoardOfType(state, TYPE_ROBOT)
    ).toEqual({'3,0,-3': 'Attack Bot'});

    // Can't play a robot on an existing location.
    state = playObject(state, 'orange', cards.attackBotCard, '3,0,-3');
    expect(
      objectsOnBoardOfType(state, TYPE_ROBOT)
    ).toEqual({'3,0,-3': 'Attack Bot'});

    // Can play a structure adjacent to a robot.
    state = playObject(state, 'orange', cards.fortificationCard, '2,0,-2');
    expect(
      objectsOnBoardOfType(state, TYPE_STRUCTURE)
    ).toEqual({'2,0,-2': 'Fortification'});
    state = playObject(state, 'orange', cards.fortificationCard, '0,0,0');
    expect(
      objectsOnBoardOfType(state, TYPE_STRUCTURE)
    ).toEqual({'2,0,-2': 'Fortification'});

    // Can't play a structure on an existing location.
    state = playObject(state, 'orange', cards.fortificationCard, '2,0,-2');
    expect(
      objectsOnBoardOfType(state, TYPE_STRUCTURE)
    ).toEqual({'2,0,-2': 'Fortification'});
  });

  it('should be able to play events and execute the commands within', () => {
    let state = defaultState;

    const startingCardsInHand = state.players.orange.hand.length;
    const startingEnergy = state.players.orange.energy.available;

    // Simple card example: "Draw two cards."
    state = playEvent(state, 'orange', '(function () { actions["draw"](targets["self"](), 2); })');
    expect(
      state.players.orange.hand.length
    ).toEqual(startingCardsInHand + 2);

    // More complex card example: "Gain energy equal to the number of kernels in play."
    state = playEvent(state, 'orange', '(function () { actions["modifyEnergy"](targets["self"](), function (x) { return x + count(objectsInPlay("kernel")); }); })');
    expect(
      state.players.orange.energy.available
    ).toEqual(startingEnergy + 2);
  });

  it('should be able to move robots', () => {
    let state = defaultState;
    state = playObject(state, 'orange', cards.attackBotCard, '3,0,-3');

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

  it('(TODO) should be able to handle combat between robots', () => {
    //   Combat when no robot dies
    //   Combat when defender dies (+ attacker takes its place)
    //   Combat when attacker dies
    //   Combat when both robots die
    //   Combat between robot and structure/core
    //   Movement into combat
  });

  it('should be able to enforce victory conditions', () => {
    // Orange victory: move an Attack Bot to the blue core and hit it 20 times.
    let state = defaultState;
    state = playObject(state, 'orange', cards.attackBotCard, '3,0,-3');
    state = newTurn(state, 'orange');
    state = moveRobot(state, '3,0,-3', '1,0,-1');
    state = newTurn(state, 'orange');
    state = moveRobot(state, '1,0,-1', '-1,0,1');
    state = newTurn(state, 'orange');
    state = moveRobot(state, '-1,0,1', '-3,0,3');
    _.times(20, () => {
      expect(state.winner).toEqual(null);
      state = newTurn(state, 'orange');
      state = attack(state, '-3,0,3', '-4,0,4');
    });
    expect(state.winner).toEqual('orange');

    // Blue victory: move an Attack Bot to the orange core and hit it 20 times.
    state = defaultState;
    state = playObject(state, 'blue', cards.attackBotCard, '-3,0,3');
    state = newTurn(state, 'blue');
    state = moveRobot(state, '-3,0,3', '-1,0,1');
    state = newTurn(state, 'blue');
    state = moveRobot(state, '-1,0,1', '1,0,-1');
    state = newTurn(state, 'blue');
    state = moveRobot(state, '1,0,-1', '3,0,-3');
    _.times(20, () => {
      expect(state.winner).toEqual(null);
      state = newTurn(state, 'blue');
      state = attack(state, '3,0,-3', '4,0,-4');
    });
    expect(state.winner).toEqual('blue');
  });
});
