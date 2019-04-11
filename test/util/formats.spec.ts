import { constant, flatMap, times, uniqueId } from 'lodash';

import * as robots from '../../src/common/store/coreSet/robots';
import * as w from '../../src/common/types';
import {
  BuiltinOnlyGameFormat,
  GameFormat,
  NormalGameFormat,
  SetFormat,
  SharedDeckGameFormat
} from '../../src/common/util/formats';
import { cantripCard } from '../data/cards';
import { constantDeck, defaultDecks } from '../data/decks';

function validDecks(gameFormat: GameFormat, decksToTest: Record<string, w.Deck>): string[] {
  return Object.keys(decksToTest).filter((deckName) => (gameFormat.isDeckValid(decksToTest[deckName])));
}

export function deckFromCards(cards: w.CardInStore[], numCopiesPerCard: number): w.Deck {
  const deckId: string = uniqueId();
  const cardsWithCopies: w.CardInStore[] = flatMap(cards, (c) => times(numCopiesPerCard, constant(c)));

  return {
    id: deckId,
    name: deckId,
    cardIds: cardsWithCopies.map((card) => card.id),
    cards: cardsWithCopies,
    setId: 'set'  // to enable these decks to pass the SetFormat test if otherwise valid
  };
}

describe('GameFormat#isDeckValid', () => {
  const defaultDeck = defaultDecks[0];
  const constantBuiltinCardDeck = constantDeck(robots.oneBotCard);
  const tooLargeBuiltinCardDeck = constantDeck(robots.oneBotCard, 60);
  const tooSmallBuiltinCardDeck = constantDeck(robots.oneBotCard, 20);
  const constantUserCardDeck = constantDeck(cantripCard);

  const decks: Record<string, w.Deck> = {
    defaultDeck,
    constantBuiltinCardDeck,
    tooLargeBuiltinCardDeck,
    tooSmallBuiltinCardDeck,
    constantUserCardDeck
  };

  it('new GameFormat() doesn\'t accept any decks', () => {
    expect(validDecks(new GameFormat(), decks)).toEqual([]);
  });

  it('NormalGameFormat and SharedDeckGameFormat accept any deck that has 30 cards', () => {
    const deckNamesWith30Cards = ['defaultDeck', 'constantBuiltinCardDeck', 'constantUserCardDeck'];

    expect(validDecks(NormalGameFormat, decks)).toEqual(deckNamesWith30Cards);
    expect(validDecks(SharedDeckGameFormat, decks)).toEqual(deckNamesWith30Cards);
  });

  it('BuiltinOnlyGameFormat accepts only decks made up of 30 built-in cards', () => {
    expect(validDecks(BuiltinOnlyGameFormat, decks)).toEqual(['defaultDeck', 'constantBuiltinCardDeck']);
  });

  it('new SetFormat(set) only accepts 30-card decks made up only of cards from that set, with no more than 2 copies per card', () => {
    const builtInRobots: w.CardInStore[] = Object.values(robots);
    const set: w.Set = { id: 'set', name: 'Robots only', cards: builtInRobots, metadata: { authorId: '', authorName: '', isPublished: false, lastModified: 0 } };
    const RobotsOnlySetFormat = new SetFormat(set);

    expect(RobotsOnlySetFormat.serialized()).toEqual({ _type: 'set', set });

    // None of the decks defined above are valid.
    expect(validDecks(RobotsOnlySetFormat, decks)).toHaveLength(0);

    expect(RobotsOnlySetFormat.isDeckValid(deckFromCards([builtInRobots[0]], 2))).toBeFalsy();
    expect(RobotsOnlySetFormat.isDeckValid(deckFromCards([builtInRobots[0]], 30))).toBeFalsy();
    expect(RobotsOnlySetFormat.isDeckValid(deckFromCards(builtInRobots.slice(0, 10), 3))).toBeFalsy();
    expect(RobotsOnlySetFormat.isDeckValid(deckFromCards(builtInRobots.slice(0, 15), 1))).toBeFalsy();
    expect(RobotsOnlySetFormat.isDeckValid(deckFromCards(builtInRobots.slice(0, 15), 2))).toBeTruthy(); // 15 * 2 = 30
    expect(RobotsOnlySetFormat.isDeckValid(deckFromCards(builtInRobots.slice(0, 15), 3))).toBeFalsy();
    expect(RobotsOnlySetFormat.isDeckValid(deckFromCards(builtInRobots.slice(0, 30), 1))).toBeTruthy(); // 30 * 1 = 30
    expect(RobotsOnlySetFormat.isDeckValid(deckFromCards(builtInRobots.slice(0, 30), 2))).toBeFalsy();
    expect(RobotsOnlySetFormat.isDeckValid(deckFromCards(builtInRobots.slice(0, 35), 1))).toBeFalsy();
  });
});
