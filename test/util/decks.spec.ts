import { sortDecks } from '../../src/common/util/decks';

describe('sortDecks', () => {
  const testDecks = [
    {
      id: 'someTestId',
      name: 'testName1',
      cardIds: []
    },
    {
      id: '[someOtherTestId]',
      name: 'testName2',
      cardIds: []
    },
    {
      id: 'anotherTestId',
      name: 'testName3',
      timestamp: 100,
      cardIds: []
    }
  ];

  it('should order user-created decks before built-in decks', () => {
    const actualDeckIds = sortDecks(testDecks).map((deck) => deck.id);
    expect(actualDeckIds).toEqual(['anotherTestId', 'someTestId', '[someOtherTestId]']);
  });
});
