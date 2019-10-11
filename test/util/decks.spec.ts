import { sortDecks } from '../../src/common/util/decks';

describe('sortDecks', () => {
  const testDecks = [
    {
      id: 'someTestId',
      authorId: '',
      name: 'testName1',
      cardIds: [],
      setId: null
    },
    {
      id: '[someOtherTestId]',
      authorId: '',
      name: 'testName2',
      cardIds: [],
      setId: null
    },
    {
      id: 'anotherTestId',
      authorId: '',
      name: 'testName3',
      timestamp: 100,
      cardIds: [],
      setId: null
    }
  ];

  it('should order user-created decks before built-in decks', () => {
    const actualDeckIds = sortDecks(testDecks).map((deck) => deck.id);
    expect(actualDeckIds).toEqual(['anotherTestId', 'someTestId', '[someOtherTestId]']);
  });
});
