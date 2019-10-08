import { difference, noop, omit } from 'lodash';

import { duplicateCard } from '../../src/common/actions/collection';
import { saveCard } from '../../src/common/actions/creator';
import { TYPE_ROBOT } from '../../src/common/constants';
import collection from '../../src/common/reducers/collection';
import defaultState from '../../src/common/store/defaultCollectionState';
import * as w from '../../src/common/types';
import { createCardFromProps } from '../../src/common/util/cards';
import * as firebase from '../../src/common/util/firebase';

jest.mock('../../src/common/util/firebase');

function expectCardsToBeEqual(card1: w.CardInStore, card2: w.CardInStore): void {
  expect(omit(card1, ['id', 'metadata'])).toEqual(omit(card2, ['id', 'metadata']));
}

function defaultCollectionState(): w.CollectionState {
  return {
    ...defaultState,
    cards: [...defaultState.cards]
  };
}

describe('Collection reducer', () => {
  beforeAll(() => {
    (firebase.lookupCurrentUser as any).mockImplementation(() => ({ uid: 'test-user-id', displayName: 'test-user-name' }));
    (firebase.saveCard as any).mockImplementation(noop);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('DUPLICATE_CARD', () => {
    let state: w.CollectionState = defaultCollectionState();
    const oneBotCard: w.CardInStore = state.cards.find((c) => c.name === 'One Bot')!;
    state = collection(state, duplicateCard(oneBotCard));

    const newCards = difference(state.cards, defaultState.cards);
    expect(newCards.length).toEqual(1);
    expectCardsToBeEqual(newCards[0], { ...oneBotCard, name: 'Copy of One Bot' });
    expect(firebase.saveCard).toHaveBeenCalledTimes(1);
  });

  describe('SAVE_CARD', () => {
    const testBotCreatorState: w.CreatorState = {
      attack: 1,
      cost: 1,
      health: 1,
      id: null,
      name: 'Test Bot',
      parserVersion: null,
      sentences: [],
      speed: 1,
      spriteID: '',
      text: '',
      type: TYPE_ROBOT,
      willCreateAnother: false
    };
    const testBotCard: w.CardInStore = createCardFromProps(testBotCreatorState);  // tslint:disable-line mocha-no-side-effect-code

    it('creates new card', () => {
      let state: w.CollectionState = defaultCollectionState();
      state = collection(state, saveCard(testBotCreatorState));

      const newCards = difference(state.cards, defaultState.cards);
      expect(newCards.length).toEqual(1);
      expectCardsToBeEqual(newCards[0], testBotCard);
      expect(firebase.saveCard).toHaveBeenCalledTimes(1);
      expectCardsToBeEqual((firebase.saveCard as any).mock.calls[0][0], testBotCard);
    });

    it('edits existing cards', () => {
      let state: w.CollectionState = defaultCollectionState();

      // Create Test Bot ...
      state = collection(state, saveCard(testBotCreatorState));
      // ... then edit its cost to be 2
      const testBotId: w.CardId = difference(state.cards, defaultState.cards)[0].id;
      const editedTestBotCreatorState: w.CreatorState = { ...testBotCreatorState, id: testBotId, cost: 2 };
      state = collection(state, saveCard(editedTestBotCreatorState));

      // Only the edited card should be in the player's collection now
      const newCards = difference(state.cards, defaultState.cards);
      expect(newCards.length).toEqual(1);
      expectCardsToBeEqual(newCards[0], { ...testBotCard, cost: 2 });

      // firebase.saveCard() should have been called twice (once for the creation, once for the edit)
      expect(firebase.saveCard).toHaveBeenCalledTimes(2);
    });
  });
});
