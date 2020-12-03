import { find, size, times } from 'lodash';

import { BLUE_CORE_HEX, ORANGE_CORE_HEX, STARTING_PLAYER_HEALTH, TYPE_ROBOT } from '../../src/common/constants';
import * as cards from '../../src/common/store/cards';
import * as w from '../../src/common/types';
import * as testCards from '../data/cards';
import {
  attack, drawCardToHand, getDefaultState, moveRobot,
  newTurn, objectsOnBoardOfType, playEvent, playObject, queryObjectAttribute, queryPlayerHealth,
  setUpBoardState, startingHandSize
} from '../testHelpers';

describe('[vocabulary.triggers]', () => {
  describe('[Triggered abilities]', () => {
    it('should be able to activate afterAttack triggered abilities', () => {
      // Monkey Bot: "When this robot attacks, it deals damage to all adjacent robots instead.""
      let state = setUpBoardState({
        orange: {
          '0,0,0': cards.monkeyBotCard, // 2/2
          '1,0,-1': testCards.attackBotCard // 1/1
        },
        blue: {
          '-1,0,1': cards.twoBotCard, // 2/4
          '0,-1,1': cards.twoBotCard, // 2/4
          '-1,1,0': testCards.attackBotCard // 1/1
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
        orange: {
          '0,0,0': testCards.wisdomBotCard // 1/3
        },
        blue: {
          '-1,0,1': testCards.attackBotCard, // 1/1
          '0,-1,1': testCards.attackBotCard, // 1/1
          '-1,1,0': testCards.attackBotCard // 1/1
        }
      });
      state = newTurn(state, 'blue');
      state = attack(state, '-1,0,1', '0,0,0');
      state = attack(state, '0,-1,1', '0,0,0');
      state = attack(state, '-1,1,0', '0,0,0');
      expect(objectsOnBoardOfType(state, TYPE_ROBOT)).toEqual({});
      expect(
        state.players.orange.hand.length
      ).toEqual(startingHandSize + 3);

    });

    it('should be able to activate afterDestroyed triggered abilities', () => {
      // Arena: "Whenever a robot is destroyed in combat, deal 1 damage to its controller."
      let state = setUpBoardState({
        orange: {
          '1,0,-1': cards.arenaCard,
          '0,0,0': testCards.attackBotCard
        },
        blue: {
          '-1,0,1': cards.twoBotCard,
          '0,-1,1': testCards.attackBotCard,
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
        orange: {
          '0,0,0': cards.martyrBotCard,
          '1,0,-1': cards.defenderBotCard  // adjacent to Martyr Bot (but already controlled by orange)
        },
        blue: {
          '-1,0,1': cards.twoBotCard,  // will attack
          '-1,1,0': testCards.attackBotCard,  // adjacent to Martyr Bot
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
      state = playObject(state, 'orange', testCards.attackBotCard, '3,-1,-2');
      state = playObject(state, 'orange', cards.generalBotCard, '2,1,-3');
      state = moveRobot(state, '3,-1,-2', '1,-1,0');  // General Bot allows Attack Bot to move.
      expect(
        objectsOnBoardOfType(state, TYPE_ROBOT)
      ).toEqual({'1,-1,0': 'Attack Bot', '2,1,-3': 'General Bot'});
    });

    it('should be able to choose targets for afterPlayed triggered abilities', () => {
      // Test ability to select a card in hand.
      // "When this robot is played, reduce the cost of a card in your hand by 2."
      let state = getDefaultState();
      state = drawCardToHand(state, 'orange', cards.flametongueBotCard);
      state = playObject(state, 'orange', testCards.investorBotCard, '2,1,-3', {card: cards.flametongueBotCard});
      expect(
        (find(state.players.orange.hand, {name: 'Flametongue Bot'})! as w.CardInGame).cost
      ).toEqual(cards.flametongueBotCard.cost - 2);

      // Test ability to select an object on the board.
      // "When this robot is played, deal 4 damage."
      state = playObject(state, 'orange', cards.flametongueBotCard, '3,-1,-2', {hex: BLUE_CORE_HEX});
      expect(queryPlayerHealth(state, 'blue')).toEqual(STARTING_PLAYER_HEALTH - 4);
    });

    it('should destroy robots whose health is reduced to ≤0 by afterPlayed triggered abilities', () => {
      // Accelerator: "Startup: Give all friendly robots +1 speed and -1 health."
      let state = getDefaultState();
      state = playObject(state, 'orange', testCards.attackBotCard, '3,-1,-2'); // 1/1 robot, should be destroyed by Accelerator
      state = playObject(state, 'orange', cards.acceleratorCard, '2,1,-3');
      expect(objectsOnBoardOfType(state, TYPE_ROBOT)).toEqual({});
    });

    it('should be able to activate afterCardPlay triggered abilities', () => {
      // Mirror: "When you play a robot, this structure becomes a copy of that robot."
      let state = getDefaultState();
      state = playObject(state, 'orange', cards.mirrorCard, '3,-1,-2');
      state = playObject(state, 'orange', cards.speedyBotCard, '2,1,-3');
      expect(
        objectsOnBoardOfType(state, TYPE_ROBOT)
      ).toEqual({'3,-1,-2': 'Speedy Bot', '2,1,-3': 'Speedy Bot'});
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
        orange: {
          '0,0,0': cards.botOfPainCard, // 2/3
          '1,-2,1': testCards.attackBotCard // 1/1
        },
        blue: {
          '2,0,-2': cards.twoBotCard, // 2/4
          '-2,0,2': testCards.wisdomBotCard, // 1/3
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

    it('should be able to activate afterCardEntersDiscardPile triggered abilites', () => {
      // Discard Muncher: "Whenever any card enters your discard pile, gain 1 life."
      let state = getDefaultState();
      state = playObject(state, 'orange', testCards.discardMuncherCard, '3,-1,-2');
      state = playEvent(state, 'orange', cards.superchargeCard);
      expect(queryPlayerHealth(state, 'orange')).toEqual(STARTING_PLAYER_HEALTH + 1);
    });

    it('should be able to activate afterCardDraw triggered abilites', () => {
      // Fairness Field: "Whenever a player draws a card, that player discards a random card."
      let state = getDefaultState();
      state = playObject(state, 'orange', testCards.fairnessField, '3,-1,-2');
      state = newTurn(state, 'blue');
      state = newTurn(state, 'orange');
      state = newTurn(state, 'blue');
      state = newTurn(state, 'orange');

      expect(state.players.orange.hand.length).toEqual(startingHandSize);
      expect(state.players.blue.hand.length).toEqual(startingHandSize);
      expect(state.players.orange.discardPile.length).toEqual(2);
      expect(state.players.blue.discardPile.length).toEqual(2);
    });

    it('should be able to activate afterDestroysOtherObject triggered abilites', () => {
      // Looter Bot: "Whenever this robot destroys an enemy robot, draw a card."
      let state = setUpBoardState({
        orange: {
          '0,0,0': testCards.looterBotCard // 2/2
        },
        blue: {
          '-1,0,1': testCards.attackBotCard, // 1/1
        }
      });

      state = newTurn(state, 'orange');
      const handSize = state.players.orange.hand.length;
      state = attack(state, '0,0,0', '-1,0,1');
      expect(state.players.orange.hand.length).toEqual(handSize + 1);
    });

    it('should be able to activate afterMove triggered abilites', () => {
      // Walking Monk: "Whenever this robot moves, gain 1 life."
      let state = getDefaultState();
      state = playObject(state, 'orange', testCards.walkingMonkCard, '3,-1,-2');
      state = moveRobot(state, '3,-1,-2', '2,-1,-1', true);
      expect(queryPlayerHealth(state, 'orange')).toEqual(STARTING_PLAYER_HEALTH + 1);
    });
  });
});
