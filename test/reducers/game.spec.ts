import * as Flatted from 'flatted';
import { cloneDeep, findIndex, size, times } from 'lodash';

import * as actions from '../../src/common/actions/game';
import {
  BLUE_CORE_HEX, DECK_SIZE, ORANGE_CORE_HEX, STARTING_PLAYER_HEALTH,
  TYPE_ROBOT, TYPE_STRUCTURE
} from '../../src/common/constants';
import game from '../../src/common/reducers/game';
import * as cards from '../../src/common/store/cards';
import defaultState from '../../src/common/store/defaultGameState';
import * as w from '../../src/common/types';
import { instantiateCard } from '../../src/common/util/cards';
import { getCost } from '../../src/common/util/game';
import * as testCards from '../data/cards';
import {
  activate, action, attack, drawCardToHand, getDefaultState, moveRobot,
  newTurn, objectsOnBoardOfType, playEvent, playObject, queryObjectAttribute, queryPlayerHealth, queryRobotAttributes,
  setUpBoardState, startingHandSize, withConsoleErrorsSuppressed
} from '../testHelpers';

describe('Game reducer', () => {
  it('should return the initial state', () => {
    const gameState = game();
    const expectedGameState = {...cloneDeep(defaultState), actionId: gameState.actionId};
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
      state = playObject(state, 'orange', testCards.attackBotCard, '3,-1,-2');
      expect(
        objectsOnBoardOfType(state, TYPE_ROBOT)
      ).toEqual({'3,-1,-2': 'Attack Bot'});

      // Can't play a robot far from core.
      state = playObject(state, 'orange', testCards.attackBotCard, '1,0,-1');
      expect(
        objectsOnBoardOfType(state, TYPE_ROBOT)
      ).toEqual({'3,-1,-2': 'Attack Bot'});

      // Can't play a robot on an existing location.
      state = playObject(state, 'orange', testCards.attackBotCard, '3,-1,-2');
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
      state = playObject(state, 'orange', testCards.attackBotCard, '3,-1,-2');

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
        orange: {
          [orangeTwoBotPos]: cards.twoBotCard,
          [orangeAttackBotPos]: testCards.attackBotCard
        },
        blue: {
          [blueTwoBotPos]: cards.twoBotCard,
          [blueAttackBotPos]: testCards.attackBotCard
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
      state = moveRobot(state, blueAttackBotPos, '-2,1,1');
      state = newTurn(state, 'blue');
      state = game(state, [
        actions.setSelectedTile('-2,1,1', 'blue'),
        actions.moveRobot('-2,1,1', blueAttackBotPos),
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
        state.players.blue.objectsOnBoard[blueTwoBotPos].card.name
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
      state = playObject(state, 'orange', testCards.attackBotCard, '3,-1,-2');
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
      state = playObject(state, 'blue', testCards.attackBotCard, '-3,1,2');
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

    it('should enforce victory conditions at turn end', () => {
      let state = getDefaultState();
      state = playObject(state, 'blue', testCards.instantKernelKillerAbilityCard, '-3,1,2');
      state = newTurn(state, 'blue');
      expect(state.winner).toEqual('blue');
    });

    it('should handle draws', () => {
      let state = getDefaultState();
      state = playEvent(state, 'orange', action('Destroy each kernel', "(function () { actions['destroy'](objectsMatchingConditions('kernel', [])); })"));
      expect(state.winner).toEqual('draw');
    });
  });

  describe('[Events]', () => {
    it('should be able to play events and execute the commands within', () => {
      let state = getDefaultState();

      // "Draw two cards."
      state = playEvent(state, 'orange', cards.concentrationCard);
      expect(
        state.players.orange.hand.length
      ).toEqual(startingHandSize + 2);

      // "Destroy all robots."
      state = playObject(state, 'orange', testCards.attackBotCard, '3,-1,-2');
      state = playEvent(state, 'orange', testCards.wrathOfRobotGodCard);
      expect(objectsOnBoardOfType(state, TYPE_ROBOT)).toEqual({});

      // "Deal 4 damage to your opponent."
      state = playEvent(state, 'orange', cards.missileStrikeCard);
      expect(queryPlayerHealth(state, 'blue')).toEqual(STARTING_PLAYER_HEALTH - 4);

      // "End the turn."
      state = playEvent(state, 'orange', action('End the turn', "(function () { actions['endTurn'](); })"));
      expect(state.currentTurn).toEqual('blue');
    });

    it('should be able to play events that target selected tiles or cards', () => {
      // Test ability to select a tile with an object:
      // "Deal 3 damage to a robot."
      let state = getDefaultState();
      state = playObject(state, 'orange', testCards.attackBotCard, '3,-1,-2');
      state = playEvent(state, 'blue', cards.shockCard, {hex: '3,-1,-2'});
      expect(objectsOnBoardOfType(state, TYPE_ROBOT)).toEqual({});

      // Test ability to select an empty tile:
      // "Deal 1 damage to everything adjacent to a tile."
      state = playObject(state, 'orange', testCards.attackBotCard, '3,-1,-2');
      state = playObject(state, 'orange', testCards.attackBotCard, '2,1,-3');
      state = playEvent(state, 'blue', cards.firestormCard, {hex: '2,0,-2'});
      expect(objectsOnBoardOfType(state, TYPE_ROBOT)).toEqual({});
      expect(queryPlayerHealth(state, 'orange')).toEqual(STARTING_PLAYER_HEALTH - 1);

      // Test ability to select a card in hand.
      // "Discard a robot card. Gain life equal to its health."
      // (This also tests the ability to store 'it' in game state for later retrieval.)
      state = drawCardToHand(state, 'blue', cards.twoBotCard);
      state = playEvent(state, 'blue', cards.consumeCard, {card: cards.twoBotCard});
      expect(
        state.players.blue.hand.length
      ).toEqual(startingHandSize);
      expect(queryPlayerHealth(state, 'blue')).toEqual(STARTING_PLAYER_HEALTH + 4);
    });

    it('should be able to play events with multiple target selection', () => {
      let state = getDefaultState();
      state = playObject(state, 'orange', testCards.attackBotCard, '3,-1,-2');
      // "Move a robot up to two spaces."
      state = playEvent(state, 'orange', cards.gustOfWindCard, [{hex: '3,-1,-2'}, {hex: '1,-1,0'}]);
      expect(
        objectsOnBoardOfType(state, TYPE_ROBOT)
      ).toEqual({'1,-1,0': 'Attack Bot'});
    });

    it('should not be able to play an event if there are no valid targets', () => {
      let state = getDefaultState();
      state = playEvent(state, 'orange', cards.smashCard);
      expect(state.players.orange.hand.map((c) => (c as w.CardInGame).name)).toContain(cards.smashCard.name);
    });

    it('should be able to handle commands with delayed execution for "they"', () => {
      let state = getDefaultState();
      state = playObject(state, 'orange', cards.oneBotCard, '3,-1,-2');
      state = playObject(state, 'orange', cards.twoBotCard, '2,1,-3');
      state = playEvent(state, 'orange', cards.equalizeCard); // "Set the attack of all robots equal to their health."
      expect(queryRobotAttributes(state, '3,-1,-2')).toEqual('2/2/2');
      expect(queryRobotAttributes(state, '2,1,-3')).toEqual('4/4/1');
    });

    it('should correctly handle temporary attribute modifications', () => {
      let state = getDefaultState();
      state = playObject(state, 'orange', cards.oneBotCard, '3,-1,-2');  // 1/2/2

      state = playEvent(state, 'orange', action("Give all robots you control +2 attack until the end of the turn.", "(function () { save('duration', 1); (function () { actions['modifyAttribute'](objectsMatchingConditions('robot', [conditions['controlledBy'](targets['self']())]), 'attack', function (x) { return x + 2; }); })(); save('duration', null); })"));
      expect(queryRobotAttributes(state, '3,-1,-2')).toEqual('3/2/2');
      state = game(state, actions.passTurn('orange'));
      expect(queryRobotAttributes(state, '3,-1,-2')).toEqual('1/2/2');

      state = playEvent(state, 'blue', action("Set all attributes of all robots to 3 until the end of the turn", "(function () { save('duration', 1); (function () { actions['setAttribute'](objectsMatchingConditions('robot', []), 'allattributes', \"(function () { return 3; })\"); })(); save('duration', null); })"));
      expect(queryRobotAttributes(state, '3,-1,-2')).toEqual('3/3/3');
      state = game(state, actions.passTurn('blue'));
      expect(queryRobotAttributes(state, '3,-1,-2')).toEqual('1/2/2');
    });
  });

  // (For triggered ability tests, see test/vocabulary/triggers.spec.ts)

  describe('[Passive abilities]', () => {
    it('should let objects apply keyword effects to themselves', () => {
      // Defender Bot: "Defender, taunt."
      let state = setUpBoardState({
        orange: {
          '0,0,0': cards.defenderBotCard,  // 3/3
          '0,-2,2': testCards.attackBotCard  // 3/3
        },
        blue: {
          '0,-1,1': testCards.attackBotCard  // 1/1
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
      state = playObject(state, 'orange', testCards.hasteBotCard, '3,-1,-2');
      state = moveRobot(state, '3,-1,-2', '2,-1,-1');
      expect(objectsOnBoardOfType(state, TYPE_ROBOT)).toHaveProperty('2,-1,-1');
      // ... but its Haste ability is not triggered when other robots are played.
      state = playObject(state, 'orange', testCards.attackBotCard, '3,-1,-2');
      state = moveRobot(state, '2,-1,-1', '1,-1,0');
      expect(objectsOnBoardOfType(state, TYPE_ROBOT)).not.toHaveProperty('1,-1,0');
    });

    it('should let objects apply passive abilities to other objects', () => {
      // General Bot: "Your adjacent robots have +1 attack. When this robot is played, all of your robots can move again."
      // Fortification: "Your adjacent robots have +1 health."
      let state = setUpBoardState({
        orange: {
          '1,0,-1': testCards.attackBotCard,  // 1/1
          '1,-1,0': cards.generalBotCard,  // +1/0
          '1,1,-2': cards.fortificationCard  // +0/1
        },
        blue: {
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
      state = playObject(state, 'orange', testCards.attackBotCard, '2,1,-3');
      expect(queryRobotAttributes(state, '2,1,-3')).toEqual('1/2/2');

      // Place another Fortification adjacent to the Attack Bot to duplicate its passive ability.
      state = playObject(state, 'orange', cards.fortificationCard, '1,2,-3');
      expect(queryRobotAttributes(state, '2,1,-3')).toEqual('1/3/2');

      // Move the Attack Bot away from both Fortification.
      // Note that the blue Fortification at 3,-2,-1 shouldn't affect the orange Attack Bot.
      state = moveRobot(state, '2,1,-3', '3,-1,-2', true);
      expect(queryRobotAttributes(state, '3,-1,-2')).toEqual('1/1/2');

      // Health Aura: "All robots 2 spaces away have +2 health."
      // The Health Aura at 1,0,-1 should affect the Attack Bot two spaces away at 3,1,-2,
      // but NOT the Attack Bot one space away at 2,-1,-1.
      state = playObject(state, 'orange', testCards.healthAuraCard, '1,0,-1');
      expect(queryRobotAttributes(state, '3,-1,-2')).toEqual('1/3/2');
      expect(queryRobotAttributes(state, '2,-1,-1')).toEqual('1/1/2');
    });

    it('should let objects apply passive abilities to cards in hand', () => {
      function costOf(player: w.PlayerInGameState, card: w.CardInStore): number {
        return getCost((player.hand as w.CardInGame[]).find((c) => c.name === card.name)!);
      }

      // Recruiter Bot: "Robots you play cost 1 less energy."
      let state = getDefaultState();
      state = drawCardToHand(state, 'orange', testCards.attackBotCard);
      state = drawCardToHand(state, 'orange', cards.monkeyBotCard);
      state = playObject(state, 'orange', cards.recruiterBotCard, '3,-1,-2');
      state = drawCardToHand(state, 'orange', cards.generalBotCard);
      state = drawCardToHand(state, 'orange', cards.fortificationCard);

      // Robots drawn both before and after Recruiter Bot is played should have their cost reduced.
      expect(costOf(state.players.orange, testCards.attackBotCard)).toEqual(0);
      expect(costOf(state.players.orange, cards.monkeyBotCard)).toEqual(cards.monkeyBotCard.cost - 1);
      expect(costOf(state.players.orange, cards.generalBotCard)).toEqual(cards.generalBotCard.cost - 1);
      expect(costOf(state.players.orange, cards.fortificationCard)).toEqual(cards.fortificationCard.cost); // Not a robot!

      // Test interaction with Discount ("Reduce the cost of all cards in your hand by 1").
      state = playEvent(state, 'orange', cards.discountCard);
      expect(costOf(state.players.orange, testCards.attackBotCard)).toEqual(0);  // Can't go below 0!
      expect(costOf(state.players.orange, cards.monkeyBotCard)).toEqual(cards.monkeyBotCard.cost - 1 - 1);
      expect(costOf(state.players.orange, cards.generalBotCard)).toEqual(cards.generalBotCard.cost - 1 - 1);
      expect(costOf(state.players.orange, cards.fortificationCard)).toEqual(cards.fortificationCard.cost - 1);

      // Test interaction with Investor Bot ("When this robot is played, reduce the cost of a card in your hand by 2").
      state = playObject(state, 'orange', testCards.investorBotCard, '2,1,-3', {card: cards.generalBotCard});
      expect(costOf(state.players.orange, testCards.attackBotCard)).toEqual(0);
      expect(costOf(state.players.orange, cards.monkeyBotCard)).toEqual(cards.monkeyBotCard.cost - 1 - 1);
      expect(costOf(state.players.orange, cards.generalBotCard)).toEqual(cards.generalBotCard.cost - 1 - 1 - 2);
      expect(costOf(state.players.orange, cards.fortificationCard)).toEqual(cards.fortificationCard.cost - 1);

      // Now destroy Recruiter Bot.
      state = playEvent(state, 'orange', cards.shockCard, {hex: '3,-1,-2'});
      expect(costOf(state.players.orange, testCards.attackBotCard)).toEqual(0);
      expect(costOf(state.players.orange, cards.monkeyBotCard)).toEqual(cards.monkeyBotCard.cost - 1);
      expect(costOf(state.players.orange, cards.generalBotCard)).toEqual(cards.generalBotCard.cost - 1 - 2);
      expect(costOf(state.players.orange, cards.fortificationCard)).toEqual(cards.fortificationCard.cost - 1);
    });

    it('should facilitate correct interaction between permanent adjustments, temporary adjustments, and conditions', () => {
      let state = getDefaultState();
      state = playObject(state, 'orange', testCards.attackBotCard, '1,2,-3');  // 1/1
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
      expect(state.players.orange.energy.available).toEqual(energy + (3 + 1 + 2) + (2 + 2));
    });

    it('should let objects assign keywords to other objects', () => {
      let state = setUpBoardState({
        orange: {
          '0,0,0': testCards.attackBotCard,
          '1,0,-1': testCards.attackBotCard
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
      state = playObject(state, 'orange', testCards.attackBotCard, '2,0,-2');
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
        orange: {
          '-3,1,2': testCards.attackBotCard
        }
      });

      function handSize(): number {
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
      // console.log(state.players.orange.objectsOnBoard['-3,1,2']);
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
      function hand(): string {
        return (state.players.orange.hand as w.CardInGame[]).map((c) => c.name).join(',');
      }

      let state = setUpBoardState({
        blue: {
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
      expect(queryObjectAttribute(state, '1,1,-2', 'health')).toEqual(cards.fortificationCard.stats!.health);

      // Can't attack then activate on the same turn.
      state = newTurn(state, 'orange');
      state = attack(state, '2,1,-3', '1,1,-2');
      expect(queryObjectAttribute(state, '1,1,-2', 'health')).toEqual(cards.fortificationCard.stats!.health - 1);
      currentHand = hand();
      state = activate(state, '2,1,-3', 0, {card: 0});
      expect(hand()).toEqual(currentHand);
    });

    it('should handle activated abilities with energy costs', () => {
      let state = getDefaultState();
      // Govt Researcher: "Activate: Pay 1 energy and each player draws a card"
      state = playObject(state, 'orange', cards.governmentResearcherCard, '2,1,-3');

      state = newTurn(state, 'orange');
      expect(state.players.orange.energy.available).toEqual(2);
      let currentHandSize = state.players.orange.hand.length;
      state = activate(state, '2,1,-3', 0);
      expect(state.players.orange.energy.available).toEqual(1);
      expect(state.players.orange.hand.length).toEqual(currentHandSize + 1);  // Ability executed

      state = newTurn(state, 'orange');
      // Now let's make the orange player not have enough energy to pay the cost.
      state.players.orange.energy.available = 0;
      currentHandSize = state.players.orange.hand.length;
      state = activate(state, '2,1,-3', 0);
      expect(state.players.orange.energy.available).toEqual(0);
      expect(state.players.orange.hand.length).toEqual(currentHandSize);  // Ability did not execute
    });

    it('should allow triggers bestowed by activated abilities to "stack"', () => {
      let state = getDefaultState();
      // Armorer: "Activate: Give an adjacent robot "Whenever this robot takes damage, restore 1 health to this robot" "
      state = playObject(state, 'orange', testCards.armorerCard, '2,1,-3');
      state = playObject(state, 'orange', cards.blueBotCard, '1,2,-3'); // 2/8/1
      // Armorer will use its activated ability *twice* on Blue Bot.
      state = activate(state, '2,1,-3', 0, { hex: '1,2,-3' }, true);
      state = activate(state, '2,1,-3', 0, { hex: '1,2,-3' }, true);
      // Now blue will play Shock, dealing 3 damage to Blue Bot.
      state = playEvent(state, 'blue', cards.shockCard, { hex: '1,2,-3' });
      // Since Blue Bot has had Armorer's ability applied twice, it should restore 2 health, thus only losing 1 health.
      expect(queryObjectAttribute(state, '1,2,-3', 'health')).toBe(cards.blueBotCard.stats!.health - 1);
    });
  });

  describe('[Shared deck mode]', () => {
    it('should share decks', () => {
      let state = getDefaultState('sharedDeck');
      expect(state.players.blue.deck).toEqual(state.players.orange.deck);
      expect(state.players.blue.deck.length + state.players.blue.hand.length + state.players.orange.hand.length).toEqual(DECK_SIZE * 2);

      state = newTurn(state, 'orange');
      expect(state.players.blue.deck).toEqual(state.players.orange.deck);

      state = newTurn(state, 'blue');
      expect(state.players.blue.deck).toEqual(state.players.orange.deck);
    });
  });

  describe('[Exceptions]', () => {
    it('should be able to detect when an infinite loop will occur and end the game in a draw', () => {
      let state = setUpBoardState({
        blue: {
          '1,1,-2': testCards.infiniteLoopBotCard  // Causes an infinite loop at the start of blue's turn
        }
      });
      expect(state.winner).toBeNull();

      withConsoleErrorsSuppressed(() => {
        state = newTurn(state, 'blue');
        expect(state.winner).toEqual('draw');
      });
    });
  });

  describe('[Obfuscated cards]', () => {
    it('should be able to handle revealed cards that have been affected by abilities in play', () => {
      let state = game(getDefaultState(), [
        // Pass a few times so orange has enough energy (3) to play Recruiter Bot.
        actions.passTurn('orange'),
        actions.passTurn('blue'),
        actions.passTurn('orange'),
        actions.passTurn('blue')
      ]);

      // Reveal and play a Recruiter Bot card, that will affect the cost of the Attack Bot in hand.
      let revealCardsAction = Flatted.parse(Flatted.stringify({
        type: 'ws:REVEAL_CARDS',
        payload: {
          orange: {
            hand: [cards.recruiterBotCard, testCards.attackBotCard].map(instantiateCard)
          }
        }
      }));
      state = game(state, [
        revealCardsAction,
        actions.setSelectedCard(0, 'orange'),
        actions.placeCard('3,-2,-1', 0)
      ]);

      // Now reveal the Attack Bot ... with the temporaryStatAdjustment from the Recruiter Bot!
      revealCardsAction = Flatted.parse(Flatted.stringify({
        type: 'ws:REVEAL_CARDS',
        payload: {
          orange: {
            hand: [state.players.orange.hand[0]]
          }
        }
      }));
      state = game(state, revealCardsAction);

      // Can we query getCost() on this card?
      // Or does it break because the temporaryStatAdjustment got messed up in serialization?
      expect(getCost(state.players.orange.hand[0] as w.CardInGame)).toEqual(0);
    });
  });
});
