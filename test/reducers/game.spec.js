import game from '../../src/common/reducers/game';
import * as cards from '../../src/common/store/cards';
import { TYPE_ROBOT, TYPE_STRUCTURE } from '../../src/common/constants';
import {
  getDefaultState, objectsOnBoardOfType,
  newTurn, playObject, playEvent, moveRobot, attack
} from '../test_helpers';

describe('Game reducer', () => {
  it('should return the initial state', () => {
    expect(game(undefined, {})).toEqual(getDefaultState());
  });

  it('should be able to play robots and structures', () => {
    let state = getDefaultState();

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
    let state = getDefaultState();

    // "Draw two cards."
    state = playEvent(state, 'orange', cards.concentrationCard);
    expect(
      state.players.orange.hand.length
    ).toEqual(getDefaultState().players.orange.hand.length + 2);

    // "Destroy all robots."
    state = playObject(state, 'orange', cards.attackBotCard, '3,0,-3');
    state = playEvent(state, 'orange', cards.wrathOfRobotGodCard);
    expect(
      objectsOnBoardOfType(state, TYPE_ROBOT)
    ).toEqual({});
  });

  it('should be able to move robots', () => {
    let state = getDefaultState();
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
    let state = getDefaultState();
    // First, let's move all these bots into a position where they can attack one another.
    state = playObject(state, 'orange', cards.tankBotCard, '3,0,-3');
    state = playObject(state, 'orange', cards.attackBotCard, '4,-1,-3');
    state = playObject(state, 'blue', cards.tankBotCard, '-3,0,3');
    state = playObject(state, 'blue', cards.attackBotCard, '-4,1,3');
    state = newTurn(state, 'orange');
    state = moveRobot(state, '3,0,-3', '2,0,-2');
    state = moveRobot(state, '4,-1,-3', '2,-1,-1');
    state = newTurn(state, 'blue');
    state = moveRobot(state, '-3,0,3', '-2,0,2');
    state = moveRobot(state, '-4,1,3', '-2,1,1');
    state = newTurn(state, 'orange');
    state = moveRobot(state, '2,0,-2', '1,0,-1');
    state = moveRobot(state, '2,-1,-1', '0,-1,1');
    state = newTurn(state, 'blue');
    state = moveRobot(state, '-2,0,2', '-1,0,1');
    state = moveRobot(state, '-2,1,1', '-1,1,0');
    state = newTurn(state, 'orange');
    state = moveRobot(state, '1,0,-1', '0,0,0');

    const orangeTankBotPos = '0,0,0';
    let blueTankBotPos = '-1,0,1';
    const orangeAttackBotPos = '0,-1,1';
    const blueAttackBotPos = '-1,1,0';

    expect(
      Object.keys(objectsOnBoardOfType(state, TYPE_ROBOT)).sort()
    ).toEqual([orangeTankBotPos, blueTankBotPos, orangeAttackBotPos, blueAttackBotPos].sort());

    // Robots can't attack inaccessible robots.
    state = newTurn(state, 'blue');
    state = attack(state, blueAttackBotPos, orangeAttackBotPos);
    expect(
      Object.keys(objectsOnBoardOfType(state, TYPE_ROBOT)).sort()
    ).toEqual([orangeTankBotPos, blueTankBotPos, orangeAttackBotPos, blueAttackBotPos].sort());

    // Robots can't attack friendly robots.
    state = attack(state, blueAttackBotPos, blueTankBotPos);
    expect(
      Object.keys(objectsOnBoardOfType(state, TYPE_ROBOT)).sort()
    ).toEqual([orangeTankBotPos, blueTankBotPos, orangeAttackBotPos, blueAttackBotPos].sort());

    // Combat when no robot dies. [Both Tank Bots should now be down to 4-2=2 health.]
    state = attack(state, blueTankBotPos, orangeTankBotPos);
    expect(
      Object.keys(objectsOnBoardOfType(state, TYPE_ROBOT)).sort()
    ).toEqual([orangeTankBotPos, blueTankBotPos, orangeAttackBotPos, blueAttackBotPos].sort());

    // Combat when attacker dies.
    state = attack(state, blueAttackBotPos, orangeTankBotPos);
    expect(
      Object.keys(objectsOnBoardOfType(state, TYPE_ROBOT)).sort()
    ).toEqual([orangeTankBotPos, blueTankBotPos, orangeAttackBotPos].sort());

    // Combat when defender dies and attacker takes its place.
    state = newTurn(state, 'blue');
    state = attack(state, blueTankBotPos, orangeAttackBotPos);
    blueTankBotPos = orangeAttackBotPos;
    expect(
      state.players.blue.robotsOnBoard[blueTankBotPos].card.name
    ).toEqual('Tank Bot');
    expect(
      Object.keys(objectsOnBoardOfType(state, TYPE_ROBOT)).sort()
    ).toEqual([orangeTankBotPos, blueTankBotPos].sort());

    // Combat when both robots die.
    state = newTurn(state, 'orange');
    state = attack(state, orangeTankBotPos, blueTankBotPos);
    expect(
      objectsOnBoardOfType(state, TYPE_ROBOT)
    ).toEqual({});

    // Robots with range >1 can move into combat.
    // TODO Figure out how to test this? Right now move+attack is handled in the Board component, not the reducer.
  });

  it('should be able to enforce victory conditions', () => {
    // Orange victory: move an Attack Bot to the blue core and hit it 20 times.
    let state = getDefaultState();
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
    state = getDefaultState();
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
