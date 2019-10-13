import { difference, noop, omit } from 'lodash';

import * as collectionActions from '../../src/common/actions/collection';
import * as creatorActions from '../../src/common/actions/creator';
import { TYPE_ROBOT } from '../../src/common/constants';
import collection from '../../src/common/reducers/collection';
import { oneBotCard, twoBotCard } from '../../src/common/store/cards';
import defaultState from '../../src/common/store/defaultCollectionState';
import * as w from '../../src/common/types';
import { createCardFromProps } from '../../src/common/util/cards';
import * as firebase from '../../src/common/util/firebase';
import { attackBotCard } from '../data/cards';

jest.mock('../../src/common/util/firebase');

function args(mockedFn: any, callNum: number = 0): any[] {
  return mockedFn.mock.calls[callNum];
}

function expectCardsToBeEqual(card1: w.CardInStore, card2: w.CardInStore): void {
  expect(omit(card1, ['id', 'metadata'])).toEqual(omit(card2, ['id', 'metadata']));
}

function defaultCollectionState(): w.CollectionState {
  return {
    ...defaultState,
    cards: [...defaultState.cards],
    decks: [...defaultState.decks]
  };
}

describe('Collection reducer', () => {
  beforeAll(() => {
    (firebase.lookupCurrentUser as any).mockImplementation(() => ({ uid: 'test-user-id', displayName: 'test-user-name' }));
    (firebase.removeDeck as any).mockImplementation(noop);
    (firebase.saveCard as any).mockImplementation(noop);
    (firebase.saveDeck as any).mockImplementation(noop);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('ADD_EXISTING_CARD_TO_COLLECTION', () => {
    let state: w.CollectionState = defaultCollectionState();
    state = collection(state, creatorActions.addExistingCardToCollection(attackBotCard));

    const newCards = difference(state.cards, defaultState.cards);
    expect(newCards.length).toEqual(1);
    expectCardsToBeEqual(newCards[0], attackBotCard);
    // Make sure that we're saving the card with a different id and with the current user's ownerId.
    expect(firebase.saveCard).toHaveBeenCalledTimes(1);
    expectCardsToBeEqual(args(firebase.saveCard)[0], attackBotCard);
    expect(args(firebase.saveCard)[0].id).not.toEqual(attackBotCard.id);
    expect(args(firebase.saveCard)[0].metadata).toEqual({ ...attackBotCard.metadata, ownerId: 'test-user-id' });
  });

  it('DELETE_DECK', () => {
    let state: w.CollectionState = defaultCollectionState();
    // Create One Bot Deck ...
    state = collection(state, collectionActions.saveDeck(null, 'One Bot Deck', [oneBotCard.id], null));
    const oneBotDeck: w.DeckInStore = state.decks.find((d) => d.name === 'One Bot Deck')!;
    // ... then delete it
    state = collection(state, collectionActions.deleteDeck(oneBotDeck.id));

    expect(state.decks).toEqual(defaultState.decks);
    expect(firebase.saveDeck).toHaveBeenCalledTimes(1);
    expect(firebase.removeDeck).toHaveBeenCalledTimes(1);
    expect(args(firebase.removeDeck)[0]).toEqual(oneBotDeck.id);
  });

  it('DUPLICATE_CARD', () => {
    let state: w.CollectionState = defaultCollectionState();
    state = collection(state, collectionActions.duplicateCard(oneBotCard));

    const newCards = difference(state.cards, defaultState.cards);
    expect(newCards.length).toEqual(1);
    expectCardsToBeEqual(newCards[0], { ...oneBotCard, name: 'Copy of One Bot' });
    expect(firebase.saveCard).toHaveBeenCalledTimes(1);
  });

  it('DUPLICATE_DECK', () => {
    let state: w.CollectionState = defaultCollectionState();
    const roboRampageDeck: w.DeckInStore = state.decks.find((d) => d.name === 'RoboRampage (Built-in)')!;
    state = collection(state, collectionActions.duplicateDeck(roboRampageDeck.id));

    expect(state.decks.length).toEqual(defaultState.decks.length + 1);
    expect(state.decks.map((d) => d.name)).toContain('RoboRampage (Built-in) Copy');
    expect(state.decks.find((d) => d.name === 'RoboRampage (Built-in) Copy')!.cardIds).toEqual(roboRampageDeck.cardIds);
    expect(firebase.saveDeck).toHaveBeenCalledTimes(1);
    expect(args(firebase.saveDeck)[0]).toMatchObject({ authorId: 'test-user-id', name: 'RoboRampage (Built-in) Copy', cardIds: roboRampageDeck.cardIds, setId: null });
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
      state = collection(state, creatorActions.saveCard(testBotCreatorState));

      const newCards = difference(state.cards, defaultState.cards);
      expect(newCards.length).toEqual(1);
      expectCardsToBeEqual(newCards[0], testBotCard);
      expect(firebase.saveCard).toHaveBeenCalledTimes(1);
      expectCardsToBeEqual((firebase.saveCard as any).mock.calls[0][0], testBotCard);
    });

    it('edits existing cards', () => {
      let state: w.CollectionState = defaultCollectionState();

      // Create Test Bot ...
      state = collection(state, creatorActions.saveCard(testBotCreatorState));
      // ... then edit its cost to be 2
      const testBotId: w.CardId = difference(state.cards, defaultState.cards)[0].id;
      const editedTestBotCreatorState: w.CreatorState = { ...testBotCreatorState, id: testBotId, cost: 2 };
      state = collection(state, creatorActions.saveCard(editedTestBotCreatorState));

      // Only the edited card should be in the player's collection now
      const newCards = difference(state.cards, defaultState.cards);
      expect(newCards.length).toEqual(1);
      expectCardsToBeEqual(newCards[0], { ...testBotCard, cost: 2 });

      // firebase.saveCard() should have been called twice (once for the creation, once for the edit)
      expect(firebase.saveCard).toHaveBeenCalledTimes(2);
      expectCardsToBeEqual(args(firebase.saveCard, 1)[0], { ...testBotCard, cost: 2 });
    });
  });

  describe('SAVE_DECK', () => {
    it('creates new deck', () => {
      let state: w.CollectionState = defaultCollectionState();
      state = collection(state, collectionActions.saveDeck(null, 'One Bot Deck', [oneBotCard.id], null));

      expect(state.decks.length).toEqual(defaultState.decks.length + 1);
      expect(state.decks.map((d) => d.name)).toContain('One Bot Deck');
      expect(state.decks.find((d) => d.name === 'One Bot Deck')!.cardIds).toEqual([oneBotCard.id]);
      expect(firebase.saveDeck).toHaveBeenCalledTimes(1);
      expect(args(firebase.saveDeck)[0]).toMatchObject({ authorId: 'test-user-id', name: 'One Bot Deck', cardIds: [oneBotCard.id], setId: null });
    });

    it('edits existing deck', () => {
      let state: w.CollectionState = defaultCollectionState();
      // Create One Bot Deck with one card ...
      state = collection(state, collectionActions.saveDeck(null, 'One Bot Deck', [oneBotCard.id], null));
      const oneBotDeck: w.DeckInStore = state.decks.find((d) => d.name === 'One Bot Deck')!;
      // ... then add another card to it
      state = collection(state, collectionActions.editDeck(oneBotDeck.id));
      expect(state.deckBeingEdited).toEqual(oneBotDeck);
      state = collection(state, collectionActions.saveDeck(oneBotDeck.id, 'One Bot Deck', [oneBotCard.id, twoBotCard.id], null));

      // Only the edited deck should be in the player's collection now
      expect(state.decks.length).toEqual(defaultState.decks.length + 1);
      expect(state.decks.map((d) => d.name)).toContain('One Bot Deck');
      expect(state.decks.find((d) => d.name === 'One Bot Deck')!.cardIds).toEqual([oneBotCard.id, twoBotCard.id]);

      // firebase.saveDeck() should have been called twice (once for the creation, once for the edit)
      expect(firebase.saveDeck).toHaveBeenCalledTimes(2);
      expect(args(firebase.saveDeck, 1)[0]).toMatchObject({ authorId: 'test-user-id', name: 'One Bot Deck', cardIds: [oneBotCard.id, twoBotCard.id], setId: null });
    });
  });

  // TODO tests:
  // - deleting
  // - sets (CRUD, publish)
  // - JSON import/export, Firebase import?
});
