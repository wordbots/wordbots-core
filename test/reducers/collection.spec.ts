import { difference } from 'lodash';

import { duplicateCard } from '../../src/common/actions/collection';
import collection from '../../src/common/reducers/collection';
import defaultState from '../../src/common/store/defaultCollectionState';
import * as w from '../../src/common/types';

describe('Collection reducer', () => {
  it('DUPLICATE_CARD', () => {
    const state: w.CollectionState = defaultState;
    const existingCards = [...defaultState.cards];
    const oneBotCard: w.CardInStore = existingCards.find((c) => c.name === 'One Bot')!;

    const newState = collection({...state}, duplicateCard(oneBotCard));
    const newCards = difference(newState.cards, existingCards);
    expect(newCards.length).toEqual(1);
    const newCard = newCards[0];
    expect(newCard).toEqual({
      ...oneBotCard,
      id: newCard.id,
      name: 'Copy of One Bot',
      metadata: {
        ...newCard.metadata,
        source: { type: 'user', uid: 'test-user-id', username: 'test-user-name' },
        duplicatedFrom: oneBotCard.id
      }
    });
  });
});
