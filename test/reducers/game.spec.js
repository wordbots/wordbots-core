import { cloneDeep, find, findIndex, size, times } from 'lodash';

import game from '../../src/common/reducers/game';
import * as actions from '../../src/common/actions/game';
import defaultState from '../../src/common/store/defaultGameState';
import * as cards from '../../src/common/store/cards';
import {
  BLUE_CORE_HEX, ORANGE_CORE_HEX, STARTING_PLAYER_HEALTH, TYPE_ROBOT, TYPE_STRUCTURE
} from '../../src/common/constants';
import { getCost } from '../../src/common/util/game';
import {
  getDefaultState, objectsOnBoardOfType, queryObjectAttribute, queryRobotAttributes, queryPlayerHealth,
  newTurn, drawCardToHand, playObject, playEvent, moveRobot, attack, activate,
  setUpBoardState
} from '../testHelpers';

describe('Game reducer', () => {
  it('should return the initial state', () => {
    const gameState = game(undefined, {});
    const expectedGameState = Object.assign({}, cloneDeep(defaultState), {actionId: gameState.actionId});
    expect(gameState).toEqual(expectedGameState);
  });

  describe('[Basic gameplay]', () => {
    it('should be able to play robots and structures', () => {
      let state = getDefaultState();

      // Can't play a robot if the player doesn't have enough energy.
      // (We don't use the playObject() helper here because it automatically sets player.energy.)
      state = drawCardToHand(state, 'orange', cards.generalBotCard);
      const cardIdx = findIndex(state.players.orange.hand, ['name', cards.generalBotCard.name]);
      state = newTurn(state, 'orange');
      state = game(state, [
        actions.setSelectedCard(cardIdx, 'orange'),
        actions.placeCard('3,-1,-2', cardIdx)
      ]);
      expect(objectsOnBoardOfType(state, TYPE_ROBOT)).toEqual({});
      expect(state.players.orange.status.message).toEqual('You do not have enough energy to play this card.');

      // Play an Attack Bot to 3,-1,-2, by the orange core.
      state = playObject(state, 'orange', cards.attackBotCard, '3,-1,-2');
      expect(
        objectsOnBoardOfType(state, TYPE_ROBOT)
      ).toEqual({'3,-1,-2': 'Attack Bot'});

      // Can't play a robot far from core.
      state = playObject(state, 'orange', cards.attackBotCard, '1,0,-1');
      expect(
        objectsOnBoardOfType(state, TYPE_ROBOT)
      ).toEqual({'3,-1,-2': 'Attack Bot'});

      // Can't play a robot on an existing location.
      state = playObject(state, 'orange', cards.attackBotCard, '3,-1,-2');
      expect(
        objectsOnBoardOfType(state, TYPE_ROBOT)
      ).toEqual({'3,-1,-2': 'Attack Bot'});

      // Can play a structure adjacent to a robot ...
      state = playObject(state, 'orange', cards.fortificationCard, '2,0,-2');
      expect(
        objectsOnBoardOfType(state, TYPE_STRUCTURE)
      ).toEqual({'2,0,-2': 'Fortification'});
      // ... but not far away from a robot.
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

    it('should be able to move robots', () => {
      let state = getDefaultState();
      state = playObject(state, 'orange', cards.attackBotCard, '3,-1,-2');

      // Robots cannot move on the turn they are placed.
      state = moveRobot(state, '3,-1,-2', '1,0,-1');
      expect(
        objectsOnBoardOfType(state, TYPE_ROBOT)
      ).toEqual({'3,-1,-2': 'Attack Bot'});

      state = newTurn(state, 'orange');

      // Robots cannot move into existing objects.
      state = moveRobot(state, '3,-1,-2', ORANGE_CORE_HEX); // There's a kernel there!
      expect(
        objectsOnBoardOfType(state, TYPE_ROBOT)
      ).toEqual({'3,-1,-2': 'Attack Bot'});

      // Robots can move up to their movement range (Attack Bot has range 2).
      state = moveRobot(state, '3,-1,-2', '0,-1,1'); // Try to move 3 spaces.
      expect(
        objectsOnBoardOfType(state, TYPE_ROBOT)
      ).toEqual({'3,-1,-2': 'Attack Bot'});
      state = moveRobot(state, '3,-1,-2', '1,-1,0'); // Move 2 spaces.
      expect(
        objectsOnBoardOfType(state, TYPE_ROBOT)
      ).toEqual({'1,-1,0': 'Attack Bot'});

      // Robots cannot move after they've their movesMade reaches their speed.
      state = moveRobot(state, '1,-1,0', '0,0,0'); // Try to move 1 space.
      expect(
        objectsOnBoardOfType(state, TYPE_ROBOT)
      ).toEqual({'1,-1,0': 'Attack Bot'});

      state = newTurn(state, 'orange');

      // Robots can perform a partial move.
      state = moveRobot(state, '1,-1,0', '0,-1,1'); // Move 1 space.
      state = moveRobot(state, '0,-1,1', '-1,-1,2'); // Move 1 space again.
      state = playEvent(state, 'orange', cards.threedomCard); // Increase speed from 2 to 3 ...
      state = moveRobot(state, '-1,-1,2', '-2,-1,3'); // ... and move 1 space again.

      expect(
        objectsOnBoardOfType(state, TYPE_ROBOT)
      ).toEqual({'-2,-1,3': 'Attack Bot'});
    });

    it('should be able to handle combat between robots', () => {
      const orangeTwoBotPos = '0,0,0';
      let blueTwoBotPos = '-1,0,1';
      const orangeAttackBotPos = '0,-1,1';
      const blueAttackBotPos = '-1,1,0';

      let state = setUpBoardState({
        'orange': {
          [orangeTwoBotPos]: cards.twoBotCard,
          [orangeAttackBotPos]: cards.attackBotCard
        },
        'blue': {
          [blueTwoBotPos]: cards.twoBotCard,
          [blueAttackBotPos]: cards.attackBotCard
        }
      });

      expect(
        Object.keys(objectsOnBoardOfType(state, TYPE_ROBOT)).sort()
      ).toEqual([orangeTwoBotPos, blueTwoBotPos, orangeAttackBotPos, blueAttackBotPos].sort());

      // Robots can't attack inaccessible robots.
      state = newTurn(state, 'blue');
      state = attack(state, blueAttackBotPos, orangeAttackBotPos);
      expect(
        Object.keys(objectsOnBoardOfType(state, TYPE_ROBOT)).sort()
      ).toEqual([orangeTwoBotPos, blueTwoBotPos, orangeAttackBotPos, blueAttackBotPos].sort());

      // Robots can't attack friendly robots.
      state = attack(state, blueAttackBotPos, blueTwoBotPos);
      expect(
        Object.keys(objectsOnBoardOfType(state, TYPE_ROBOT)).sort()
      ).toEqual([orangeTwoBotPos, blueTwoBotPos, orangeAttackBotPos, blueAttackBotPos].sort());

      // Combat when no robot dies. [Both Two Bots should now be down to 4-2=2 health.]
      state = attack(state, blueTwoBotPos, orangeTwoBotPos);
      expect(
        Object.keys(objectsOnBoardOfType(state, TYPE_ROBOT)).sort()
      ).toEqual([orangeTwoBotPos, blueTwoBotPos, orangeAttackBotPos, blueAttackBotPos].sort());

      // Combat when attacker dies.
      // Also, let's test moveAndAttack while we're at it, by moving the blue attack bot out of range and
      // and then (next turn) moving+attacking the orange tank bot as a single action.
      state = moveRobot(state, blueAttackBotPos, '-2,1,1');
      state = newTurn(state, 'blue');
      state = game(state, [
        actions.setSelectedTile('-2,1,1', 'blue'),
        actions.moveRobot('-2,1,1', blueAttackBotPos, true),
        actions.attack(blueAttackBotPos, orangeTwoBotPos),
        actions.attackComplete()
      ]);
      expect(
        Object.keys(objectsOnBoardOfType(state, TYPE_ROBOT)).sort()
      ).toEqual([orangeTwoBotPos, blueTwoBotPos, orangeAttackBotPos].sort());

      // Combat when defender dies and attacker takes its place.
      state = newTurn(state, 'blue');
      state = attack(state, blueTwoBotPos, orangeAttackBotPos);
      blueTwoBotPos = orangeAttackBotPos;
      expect(
        state.players.blue.robotsOnBoard[blueTwoBotPos].card.name
      ).toEqual('Two Bot');
      expect(
        Object.keys(objectsOnBoardOfType(state, TYPE_ROBOT)).sort()
      ).toEqual([orangeTwoBotPos, blueTwoBotPos].sort());

      // Combat when both robots die.
      state = newTurn(state, 'orange');
      state = attack(state, orangeTwoBotPos, blueTwoBotPos);
      expect(
        objectsOnBoardOfType(state, TYPE_ROBOT)
      ).toEqual({});
    });

    it('should be able to enforce victory conditions', () => {
      // Orange victory: move an Attack Bot to the blue core and hit it 20 times.
      let state = getDefaultState();
      state = playObject(state, 'orange', cards.attackBotCard, '3,-1,-2');
      state = newTurn(state, 'orange');
      state = moveRobot(state, '3,-1,-2', '1,-1,0');
      state = newTurn(state, 'orange');
      state = moveRobot(state, '1,-1,0', '0,0,0');
      state = newTurn(state, 'orange');
      state = moveRobot(state, '0,0,0', '-2,0,2');
      times(STARTING_PLAYER_HEALTH, () => {
        expect(state.winner).toEqual(null);
        state = newTurn(state, 'orange');
        state = attack(state, '-2,0,2', BLUE_CORE_HEX);
      });
      expect(state.winner).toEqual('orange');

      // Blue victory: move an Attack Bot to the orange core and hit it 20 times.
      state = getDefaultState();
      state = playObject(state, 'blue', cards.attackBotCard, '-3,1,2');
      state = newTurn(state, 'blue');
      state = moveRobot(state, '-3,1,2', '-1,1,0');
      state = newTurn(state, 'blue');
      state = moveRobot(state, '-1,1,0', '0,0,0');
      state = newTurn(state, 'blue');
      state = moveRobot(state, '0,0,0', '2,0,-2');
      times(STARTING_PLAYER_HEALTH, () => {
        expect(state.winner).toEqual(null);
        state = newTurn(state, 'blue');
        state = attack(state, '2,0,-2', ORANGE_CORE_HEX);
      });
      expect(state.winner).toEqual('blue');
    });
  });

  describe('[Events]', () => {
    it('should be able to play events and execute the commands within', () => {
      let state = getDefaultState();

      // "Draw two cards."
      state = playEvent(state, 'orange', cards.concentrationCard);
      expect(
        state.players.orange.hand.length
      ).toEqual(getDefaultState().players.orange.hand.length + 2);

      // "Destroy all robots."
      state = playObject(state, 'orange', cards.attackBotCard, '3,-1,-2');
      state = playEvent(state, 'orange', cards.wrathOfRobotGodCard);
      expect(objectsOnBoardOfType(state, TYPE_ROBOT)).toEqual({});

      // "Deal 5 damage to your opponent."
      state = playEvent(state, 'orange', cards.missileStrikeCard);
      expect(queryPlayerHealth(state, 'blue')).toEqual(STARTING_PLAYER_HEALTH - 4);
    });

    it('should be able to play events that target selected tiles or cards', () => {
      // Test ability to select a tile with an object:
      // "Deal 3 damage to a robot."
      let state = getDefaultState();
      state = playObject(state, 'orange', cards.attackBotCard, '3,-1,-2');
      state = playEvent(state, 'blue', cards.shockCard, {hex: '3,-1,-2'});
      expect(objectsOnBoardOfType(state, TYPE_ROBOT)).toEqual({});

      // Test ability to select an empty tile:
      // "Deal 1 damage to everything adjacent to a tile."
      state = playObject(state, 'orange', cards.attackBotCard, '3,-1,-2');
      state = playObject(state, 'orange', cards.attackBotCard, '3,1,4');
      state = playEvent(state, 'blue', cards.firestormCard, {hex: '2,0,-2'});
      expect( objectsOnBoardOfType(state, TYPE_ROBOT)).toEqual({});
      expect(queryPlayerHealth(state, 'orange')).toEqual(STARTING_PLAYER_HEALTH - 1);

      // Test ability to select a card in hand.
      // "Discard a robot card. Gain life equal to its health."
      // (This also tests the ability to store 'it' in game state for later retrieval.)
      state = drawCardToHand(state, 'blue', cards.twoBotCard);
      state = playEvent(state, 'blue', cards.consumeCard, {card: cards.twoBotCard});
      expect(
        state.players.blue.hand.length
      ).toEqual(getDefaultState().players.blue.hand.length);
      expect(queryPlayerHealth(state, 'blue')).toEqual(STARTING_PLAYER_HEALTH + 4);
    });

    it('should be able to play events with multiple target selection', () => {
      let state = getDefaultState();
      state = playObject(state, 'orange', cards.attackBotCard, '3,-1,-2');
      // "Move a robot up to two spaces."
      state = playEvent(state, 'orange', cards.gustOfWindCard, [{hex: '3,-1,-2'}, {hex: '1,-1,0'}]);
      expect(
        objectsOnBoardOfType(state, TYPE_ROBOT)
      ).toEqual({'1,-1,0': 'Attack Bot'});
    });
  });

  describe('[Triggered abilities]', () => {
    it('should be able to activate afterAttack triggered abilities', () => {
      // Monkey Bot: "When this robot attacks, it deals damage to all adjacent robots instead.""
      let state = setUpBoardState({
        'orange': {
          '0,0,0': cards.monkeyBotCard, // 2/2
          '1,0,-1': cards.attackBotCard // 1/1
        },
        'blue': {
          '-1,0,1': cards.twoBotCard, // 2/4
          '0,-1,1': cards.twoBotCard, // 2/4
          '-1,1,0': cards.attackBotCard // 1/1
        }
      });
      expect(
        Object.keys(objectsOnBoardOfType(state, TYPE_ROBOT)).sort()
      ).toEqual(['0,0,0', '1,0,-1', '-1,0,1', '0,-1,1', '-1,1,0'].sort());
      state = newTurn(state, 'orange');
      state = attack(state, '0,0,0', '-1,0,1');
      // Only the two Two Bots (each receiving 2 damage) should survive the carnage.
      expect(
        Object.keys(objectsOnBoardOfType(state, TYPE_ROBOT)).sort()
      ).toEqual(['-1,0,1', '0,-1,1'].sort());
      expect(queryObjectAttribute(state, '-1,0,1', 'health')).toEqual(2);
      expect(queryObjectAttribute(state, '0,-1,1', 'health')).toEqual(2);
    });

    it('should be able to activate afterDamageReceived triggered abilities', () => {
      // Wisdom Bot: "Whenever this robot takes damage, draw a card."
      let state = setUpBoardState({
        'orange': {
          '0,0,0': cards.wisdomBotCard // 1/3
        },
        'blue': {
          '-1,0,1': cards.attackBotCard, // 1/1
          '0,-1,1': cards.attackBotCard, // 1/1
          '-1,1,0': cards.attackBotCard // 1/1
        }
      });
      state = newTurn(state, 'blue');
      state = attack(state, '-1,0,1', '0,0,0');
      state = attack(state, '0,-1,1', '0,0,0');
      state = attack(state, '-1,1,0', '0,0,0');
      expect(objectsOnBoardOfType(state, TYPE_ROBOT)).toEqual({});
      expect(
        state.players.orange.hand.length
      ).toEqual(getDefaultState().players.orange.hand.length + 3);

    });

    it('should be able to activate afterDestroyed triggered abilities', () => {
      // Arena: "Whenever a robot is destroyed in combat, deal 1 damage to its controller."
      let state = setUpBoardState({
        'orange': {
          '1,0,-1': cards.arenaCard,
          '0,0,0': cards.attackBotCard
        },
        'blue': {
          '-1,0,1': cards.twoBotCard,
          '0,-1,1': cards.attackBotCard,
          '-2,0,2': cards.arenaCard
        }
      });
      state = newTurn(state, 'orange');
      state = attack(state, '0,0,0', '-1,0,1');  // The orange player should take one damage from each Arena.
      state = playEvent(state, 'orange', cards.shockCard, {hex: '0,-1,1'});  // No damage from Arena since this isn't combat.
      expect(queryPlayerHealth(state, 'blue')).toEqual(STARTING_PLAYER_HEALTH);
      expect(queryPlayerHealth(state, 'orange')).toEqual(STARTING_PLAYER_HEALTH - 2);

      // Martyr Bot: "When this robot is destroyed, take control of all adjacent robots."
      state = setUpBoardState({
        'orange': {
          '0,0,0': cards.martyrBotCard,
          '1,0,-1': cards.defenderBotCard  // adjacent to Martyr Bot (but already controlled by orange)
        },
        'blue': {
          '-1,0,1': cards.twoBotCard,  // will attack
          '-1,1,0': cards.attackBotCard,  // adjacent to Martyr Bot
          '-2,0,2': cards.monkeyBotCard  // not adjacent to Martyr Bot
        }
      });
      times(2, () => {
        state = newTurn(state, 'blue');
        state = attack(state, '-1,0,1', '0,0,0');
      });
      // Orange has taken control of Two Bot (now in Martyr Bot's position) and Attack Bot.
      expect(
        Object.keys(state.players.orange.robotsOnBoard).sort()
      ).toEqual([ORANGE_CORE_HEX, '1,0,-1', '0,0,0', '-1,1,0'].sort());
    });

    it('should be able to activate afterPlayed triggered abilities', () => {
      // General Bot: "Your adjacent robots have +1 attack. When this robot is played, all of your robots can move again."
      let state = getDefaultState();
      state = playObject(state, 'orange', cards.attackBotCard, '3,-1,-2');
      state = playObject(state, 'orange', cards.generalBotCard, '2,1,-3');
      state = moveRobot(state, '3,-1,-2', '1,-1,0');  // General Bot allows Attack Bot to move.
      expect(
        objectsOnBoardOfType(state, TYPE_ROBOT)
      ).toEqual({'1,-1,0': 'Attack Bot', '2,1,-3': 'General Bot'});
    });

    it('should be able to activate beginningOfTurn triggered abilities', () => {
      // Dojo Disciple: At the beginning of each of your turns, this robot gains 1 attack."
      let state = getDefaultState();
      state = playObject(state, 'orange', cards.dojoDiscipleCard, '3,-1,-2');
      state = newTurn(state, 'blue');
      expect(
        state.players.orange.robotsOnBoard['3,-1,-2'].stats.attack
      ).toEqual(0);
      state = newTurn(state, 'orange');
      expect(
        state.players.orange.robotsOnBoard['3,-1,-2'].stats.attack
      ).toEqual(1);
    });

    it('should be able to activate endOfTurn triggered abilities', () => {
      // Bot of Pain: "At the end of each turn, each robot takes 1 damage."
      let state = setUpBoardState({
        'orange': {
          '0,0,0': cards.botOfPainCard, // 2/3
          '1,-2,1': cards.attackBotCard // 1/1
        },
        'blue': {
          '2,0,-2': cards.twoBotCard, // 2/4
          '-2,0,2': cards.wisdomBotCard, // 1/3
          '0,-1,1': cards.monkeyBotCard // 2/2
        }
      });
      expect(size(objectsOnBoardOfType(state, TYPE_ROBOT))).toEqual(5);
      state = newTurn(state, 'blue');
      expect(size(objectsOnBoardOfType(state, TYPE_ROBOT))).toEqual(4);
      state = newTurn(state, 'orange');
      expect(size(objectsOnBoardOfType(state, TYPE_ROBOT))).toEqual(3);
      state = newTurn(state, 'blue');
      expect(size(objectsOnBoardOfType(state, TYPE_ROBOT))).toEqual(1);
      state = newTurn(state, 'orange'); // No more damage because Bot of Pain is destroyed.
      expect(size(objectsOnBoardOfType(state, TYPE_ROBOT))).toEqual(1);
    });

    it('should be able to choose targets for afterPlayed triggered abilities', () => {
      // Test ability to select a card in hand.
      // "When this robot is played, reduce the cost of a card in your hand by 2."
      let state = getDefaultState();
      state = drawCardToHand(state, 'orange', cards.flametongueBotCard);
      state = playObject(state, 'orange', cards.investorBotCard, '2,1,-3', {card: cards.flametongueBotCard});
      expect(
        find(state.players.orange.hand, {name: 'Flametongue Bot'}).cost
      ).toEqual(cards.flametongueBotCard.cost - 2);

      // Test ability to select an object on the board.
      // "When this robot is played, deal 4 damage."
      state = playObject(state, 'orange', cards.flametongueBotCard, '3,-1,-2', {hex: BLUE_CORE_HEX});
      expect(queryPlayerHealth(state, 'blue')).toEqual(STARTING_PLAYER_HEALTH - 4);
    });
  });

  describe('[Passive abilities]', () => {
    it('should let objects apply keyword effects to themselves', () => {
      // Defender Bot: "Defender, taunt."
      let state = setUpBoardState({
        'orange': {
          '0,0,0': cards.defenderBotCard,  // 3/3
          '0,-2,2': cards.attackBotCard  // 3/3
        },
        'blue': {
          '0,-1,1': cards.attackBotCard  // 1/1
        }
      });
      expect(size(objectsOnBoardOfType(state, TYPE_ROBOT))).toEqual(3);

      // Attack Bot cannot attack the other Attack Bot due to Defender Bot's taunt ability.
      state = attack(state, '0,-1,1', '0,-2,2', true);
      expect(size(objectsOnBoardOfType(state, TYPE_ROBOT))).toEqual(3);

      // Defender Bot cannot attack but can defend itself.
      state = attack(state, '0,0,0', '0,-1,1', true);
      expect(size(objectsOnBoardOfType(state, TYPE_ROBOT))).toEqual(3);
      state = attack(state, '0,-1,1', '0,0,0', true);
      expect(size(objectsOnBoardOfType(state, TYPE_ROBOT))).toEqual(2);

      // Haste Bot: "Haste."
      // Haste Bot can move as soon as it's played ...
      state = playObject(state, 'orange', cards.hasteBotCard, '3,-1,-2');
      state = moveRobot(state, '3,-1,-2', '2,-1,-1');
      expect(objectsOnBoardOfType(state, TYPE_ROBOT)).toHaveProperty('2,-1,-1');
      // ... but its Haste ability is not triggered when other robots are played.
      state = playObject(state, 'orange', cards.attackBotCard, '3,-1,-2');
      state = moveRobot(state, '2,-1,-1', '1,-1,0');
      expect(objectsOnBoardOfType(state, TYPE_ROBOT)).not.toHaveProperty('1,-1,0');
    });

    it('should let objects apply passive abilities to other objects', () => {
      // General Bot: "Your adjacent robots have +1 attack. When this robot is played, all of your robots can move again."
      // Fortification: "Your adjacent robots have +1 health."
      let state = setUpBoardState({
        'orange': {
          '1,0,-1': cards.attackBotCard,  // 1/1
          '1,-1,0': cards.generalBotCard,  // +1/0
          '1,1,-2': cards.fortificationCard  // +0/1
        },
        'blue': {
          '3,-2,-1': cards.fortificationCard
        }
      });

      // Attack Bot starts adjacent to both General Bot and Fortification.
      expect(queryRobotAttributes(state, '1,0,-1')).toEqual('2/2/2');

      // Move Attack Bot so it's adjacent to General Bot but not Fortification.
      state = moveRobot(state, '1,0,-1', '2,-1,-1', true);
      expect(queryRobotAttributes(state, '2,-1,-1')).toEqual('2/1/2');

      // Destroy General Bot to remove its passive ability.
      state = playEvent(state, 'orange', cards.shockCard, {hex: '1,-1,0'});
      state = playEvent(state, 'orange', cards.shockCard, {hex: '1,-1,0'});
      expect(queryRobotAttributes(state, '2,-1,-1')).toEqual('1/1/2');

      // Place a new Attack Bot that is adjacent to Fortification.
      state = playObject(state, 'orange', cards.attackBotCard, '2,1,-3');
      expect(queryRobotAttributes(state, '2,1,-3')).toEqual('1/2/2');

      // Place another Fortification adjacent to the Attack Bot to duplicate its passive ability.
      state = playObject(state, 'orange', cards.fortificationCard, '1,2,-3');
      expect(queryRobotAttributes(state, '2,1,-3')).toEqual('1/3/2');

      // Move the Attack Bot away from both Fortification.
      // Note that the blue Fortification at 3,-2,-1 shouldn't affect the orange Attack Bot.
      state = moveRobot(state, '2,1,-3', '3,-1,-2', true);
      expect(queryRobotAttributes(state, '3,-1,-2')).toEqual('1/1/2');
    });

    it('should let objects apply passive abilities to cards in hand', () => {
      function costOf(player, card) {
        return getCost(player.hand.find(c => c.name === card.name));
      }

      // Recruiter Bot: "Robots you play cost 1 less energy."
      let state = getDefaultState();
      state = drawCardToHand(state, 'orange', cards.attackBotCard);
      state = drawCardToHand(state, 'orange', cards.monkeyBotCard);
      state = playObject(state, 'orange', cards.recruiterBotCard, '3,-1,-2');
      state = drawCardToHand(state, 'orange', cards.generalBotCard);
      state = drawCardToHand(state, 'orange', cards.fortificationCard);

      // Robots drawn both before and after Recruiter Bot is played should have their cost reduced.
      expect(costOf(state.players.orange, cards.attackBotCard)).toEqual(0);
      expect(costOf(state.players.orange, cards.monkeyBotCard)).toEqual(cards.monkeyBotCard.cost - 1);
      expect(costOf(state.players.orange, cards.generalBotCard)).toEqual(cards.generalBotCard.cost - 1);
      expect(costOf(state.players.orange, cards.fortificationCard)).toEqual(cards.fortificationCard.cost); // Not a robot!

      // Test interaction with Discount ("Reduce the cost of all cards in your hand by 1").
      state = playEvent(state, 'orange', cards.discountCard);
      expect(costOf(state.players.orange, cards.attackBotCard)).toEqual(0);  // Can't go below 0!
      expect(costOf(state.players.orange, cards.monkeyBotCard)).toEqual(cards.monkeyBotCard.cost - 1 - 1);
      expect(costOf(state.players.orange, cards.generalBotCard)).toEqual(cards.generalBotCard.cost - 1 - 1);
      expect(costOf(state.players.orange, cards.fortificationCard)).toEqual(cards.fortificationCard.cost - 1);

      // Test interaction with Investor Bot ("When this robot is played, reduce the cost of a card in your hand by 2").
      state = playObject(state, 'orange', cards.investorBotCard, '2,1,-3', {card: cards.generalBotCard});
      expect(costOf(state.players.orange, cards.attackBotCard)).toEqual(0);
      expect(costOf(state.players.orange, cards.monkeyBotCard)).toEqual(cards.monkeyBotCard.cost - 1 - 1);
      expect(costOf(state.players.orange, cards.generalBotCard)).toEqual(cards.generalBotCard.cost - 1 - 1 - 2);
      expect(costOf(state.players.orange, cards.fortificationCard)).toEqual(cards.fortificationCard.cost - 1);

      // Now destroy Recruiter Bot.
      state = playEvent(state, 'orange', cards.shockCard, {hex: '3,-1,-2'});
      expect(costOf(state.players.orange, cards.attackBotCard)).toEqual(0);
      expect(costOf(state.players.orange, cards.monkeyBotCard)).toEqual(cards.monkeyBotCard.cost - 1);
      expect(costOf(state.players.orange, cards.generalBotCard)).toEqual(cards.generalBotCard.cost - 1 - 2);
      expect(costOf(state.players.orange, cards.fortificationCard)).toEqual(cards.fortificationCard.cost - 1);
    });

    it('should facilitate correct interaction between permanent adjustments, temporary adjustments, and conditions', () => {
      let state = getDefaultState();
      state = playObject(state, 'orange', cards.attackBotCard, '1,2,-3');  // 1/1
      expect(queryRobotAttributes(state, '1,2,-3')).toEqual('1/1/2');
      state = playEvent(state, 'orange', cards.threedomCard);  // "Set all stats of all robots in play to 3."
      expect(queryRobotAttributes(state, '1,2,-3')).toEqual('3/3/3');
      state = playObject(state, 'orange', cards.generalBotCard, '2,1,-3');  // 2/5; +1/0
      expect(queryRobotAttributes(state, '1,2,-3')).toEqual('4/3/3');
      state = playEvent(state, 'orange', cards.rampageCard);  // "Give all robots you control +2 attack."
      expect(queryRobotAttributes(state, '1,2,-3')).toEqual('6/3/3');
      state = playObject(state, 'orange', cards.fortificationCard, '1,1,-2');  // +0/1
      expect(queryRobotAttributes(state, '1,2,-3')).toEqual('6/4/3');
      expect(queryRobotAttributes(state, '2,1,-3')).toEqual('4/6/3');
      const energy = state.players.orange.energy.available;
      state = playEvent(state, 'orange', cards.incinerateCard);  // "Gain energy equal to the total power of robots you control. Destroy all robots you control."
      expect(state.players.orange.energy.available).toEqual(energy + (3+1+2) + (2+2));
    });

    it('should let objects assign keywords to other objects', () => {
      let state = setUpBoardState({
        'orange': {
          '0,0,0': cards.attackBotCard,
          '1,0,-1': cards.attackBotCard
        }
      });

      // Robots can't jump.
      state = moveRobot(state, '0,0,0', '2,0,-2');
      expect(objectsOnBoardOfType(state, TYPE_ROBOT)).not.toHaveProperty('2,0,-2');

      // Anti-Gravity Field: "All robots have Jump."
      state = playObject(state, 'blue', cards.antiGravityFieldCard, '-2,-1,3');
      state = newTurn(state, 'orange');

      // Robots can jump.
      state = moveRobot(state, '0,0,0', '2,0,-2');
      expect(objectsOnBoardOfType(state, TYPE_ROBOT)).toHaveProperty('2,0,-2');
      state = moveRobot(state, '1,0,-1', '2,0,-2');
      expect(objectsOnBoardOfType(state, TYPE_ROBOT)).toHaveProperty('2,0,-2');
      state = moveRobot(state, '2,0,-2', '3,1,-4', true);  // (move out of the way).

      // Newly created robots can also jump.
      state = playObject(state, 'orange', cards.attackBotCard, '2,0,-2');
      state = moveRobot(state, '2,0,-2', '1,0,-1', true);
      expect(objectsOnBoardOfType(state, TYPE_ROBOT)).toHaveProperty('1,0,-1');

      // Now, destroy the Anti-Gravity Field.
      state = playEvent(state, 'orange', cards.smashCard, {hex: '-2,-1,3'});
      expect(objectsOnBoardOfType(state, TYPE_STRUCTURE)).not.toHaveProperty('-3,0,3');

      // Robots can no longer jump.
      state = moveRobot(state, '2,0,-2', '0,0,0');
      expect(objectsOnBoardOfType(state, TYPE_ROBOT)).not.toHaveProperty('0,0,0');
      state = moveRobot(state, '2,0,-2', '1,1,-2');
      state = moveRobot(state, '1,0,-1', '1,2,-3');
      expect(objectsOnBoardOfType(state, TYPE_ROBOT)).not.toHaveProperty('1,2,-3');
    });

    it('should let objects assign triggered abilities to other objects', () => {
      let state = setUpBoardState({
        'orange': {
          '-3,1,2': cards.attackBotCard
        }
      });

      function handSize() {
        return state.players.orange.hand.length;
      }

      // No card draw.
      state = newTurn(state, 'orange');
      let currentHandSize = handSize();
      state = attack(state, '-3,1,2', '-3,0,3');
      expect(handSize()).toEqual(currentHandSize);

      // Magpie Machine: 'All robots have "Whenever this robot attacks a kernel, draw a card".'
      state = playObject(state, 'orange', cards.magpieMachineCard, '2,0,-2');

      // Card draw.
      state = newTurn(state, 'orange');
      currentHandSize = handSize();
      //console.log(state.players.orange.robotsOnBoard['-3,1,2']);
      state = attack(state, '-3,1,2', '-3,0,3');
      expect(handSize()).toEqual(currentHandSize + 1);

      // Now, destroy the Magpie Machine.
      state = playEvent(state, 'orange', cards.smashCard, {hex: '2,0,-2'});
      expect(objectsOnBoardOfType(state, TYPE_STRUCTURE)).not.toHaveProperty('2,0,-2');

      // No card draw.
      state = newTurn(state, 'orange');
      currentHandSize = handSize();
      state = attack(state, '-3,1,2', '-3,0,3');
      expect(handSize()).toEqual(currentHandSize);
    });
  });

  describe('[Activated abilities]', () => {
    it('should let objects activate activated abilities when able', () => {
      function hand() {
        return state.players.orange.hand.map(c => c.name).join(',');
      }

      let state = setUpBoardState({
        'blue': {
          '1,1,-2': cards.fortificationCard
        }
      });
      let currentHand = hand();

      // Recycler: "Activate: Discard a card, then draw a card."
      state = playObject(state, 'orange', cards.recyclerCard, '2,1,-3');

      // Can't activate the turn it's played.
      state = activate(state, '2,1,-3', 0, {card: 0});
      expect(hand()).toEqual(currentHand);

      // Can activate the next turn.
      state = newTurn(state, 'orange');
      currentHand = hand();
      state = activate(state, '2,1,-3', 0, {card: 0});
      expect(hand()).not.toEqual(currentHand);

      // Can't activate twice in a turn.
      currentHand = hand();
      state = activate(state, '2,1,-3', 0, {card: 0});
      expect(hand()).toEqual(currentHand);

      // Can't activate then attack on the same turn.
      state = attack(state, '2,1,-3', '1,1,-2');
      expect(queryObjectAttribute(state, '1,1,-2', 'health')).toEqual(cards.fortificationCard.stats.health);

      // Can't attack then activate on the same turn.
      state = newTurn(state, 'orange');
      state = attack(state, '2,1,-3', '1,1,-2');
      expect(queryObjectAttribute(state, '1,1,-2', 'health')).toEqual(cards.fortificationCard.stats.health - 1);
      currentHand = hand();
      state = activate(state, '2,1,-3', 0, {card: 0});
      expect(hand()).toEqual(currentHand);
    });
  });
});
