/** Utility methods pertaining specifically to functionality of cards-related components go here. */

import { countBy, uniqBy } from 'lodash';

import { typeToString, TYPE_EVENT, TYPE_ROBOT, TYPE_STRUCTURE } from '../../constants';
import * as w from '../../types';

import { CardDisplayOpts, Filters } from './types';
import { SortCriteria, SortOrder } from './types.enums';

/** Given an array of cards, group by card id and return an array of cards with corresponding counts. */
export function groupCards(cards: w.CardInStore[]): Array<w.CardInStore & { count: number }> {
  return uniqBy(cards, 'id').map((card) =>
    ({ ...card, count: countBy(cards, 'name')[card.name] })
  );
}

/** Given an array of cards, return those matching a given card type. */
export function selectType(cards: w.CardInStore[], type: w.CardType): w.CardInStore[] {
  return cards.filter((card) => card.type === type);
}

/** Given an array of cards and CardDisplayOpts, filter and sort the array as specified by the opts. */
export function getDisplayedCards(cards: w.CardInStore[], opts: CardDisplayOpts): w.CardInStore[] {
  return cards
    .filter((card) => isCardVisible(card, opts.filters, opts.costRange) && searchCards(card, opts.searchText))
    .sort((c1, c2) => sortCards(c1, c2, opts.sortCriteria, opts.sortOrder));
}

/** Return whether a given card matches the given types filters and cost range filter. */
export function isCardVisible(card: w.CardInStore, filters: Filters, costRange: [number, number]): boolean {
  if ((!filters.robots && card.type === TYPE_ROBOT) ||
    (!filters.events && card.type === TYPE_EVENT) ||
    (!filters.structures && card.type === TYPE_STRUCTURE) ||
    (card.cost < costRange[0] || card.cost > costRange[1])) {
    return false;
  } else {
    return true;
  }
}

/** Return whether a given card matches the given search query. */
function searchCards(card: w.CardInStore, query = ''): boolean {
  query = query.toLowerCase();
  return card.name.toLowerCase().includes(query) || (card.text || '').toLowerCase().includes(query);
}

/** Custom sort function for `CardInStore`s that takes a SortCriteria and SortOrder and performs the given sort. */
export function sortCards(c1: w.CardInStore, c2: w.CardInStore, criteria: SortCriteria, order: SortOrder = 0): 1 | 0 | -1 {
  // Individual sort columns that are composed into sort functions below.
  // (Note: We convert numbers to base-36 to preserve sorting. eg. "10" < "9" but "a" > "9".)
  const [timestamp, cost, name, type, attack, health, speed, rarity] = [
    // we want timestamp to be sorted backwards compared to other fields.
    // also, created cards without a timestamp should still come before builtin cards.
    (c: w.CardInStore) => (9999999999999 - (c.metadata.updated || (c.metadata.source.type === 'builtin' ? 0 : 1))).toString(36),
    (c: w.CardInStore) => c.cost.toString(36),
    (c: w.CardInStore) => c.name.toLowerCase(),
    (c: w.CardInStore) => typeToString(c.type),
    (c: w.CardInStore) => (c.stats?.attack || 0).toString(36),
    (c: w.CardInStore) => (c.stats?.health || 0).toString(36),
    (c: w.CardInStore) => (c.stats?.speed || 0).toString(36),
    // we want to sort rarity backwards (so 10-x rather than x)
    (c: w.CardInStore) => 10 - ({ rare: 3, uncommon: 2, common: 1, none: 0 })[(c as w.CardInStore & { rarity?: w.CardInSetRarity }).rarity || 'none']
  ];

  // Sorting functions for card collections:
  // 0 = timestamp, 1 = cost, 2 = name, 3 = type, 4 = attack, 5 = health, 6 = speed, 7 = rarity then cost
  const f = [
    (c: w.CardInStore) => [timestamp(c), cost(c), name(c)],
    (c: w.CardInStore) => [cost(c), name(c)],
    (c: w.CardInStore) => [name(c), cost(c)],
    (c: w.CardInStore) => [type(c), cost(c), name(c)],
    (c: w.CardInStore) => [attack(c), cost(c), name(c)],
    (c: w.CardInStore) => [health(c), cost(c), name(c)],
    (c: w.CardInStore) => [speed(c), cost(c), name(c)],
    (c: w.CardInStore) => [rarity(c), cost(c), timestamp(c), name(c)]
  ][criteria];

  if (f(c1) < f(c2)) {
    return order ? 1 : -1;
  } else if (f(c1) > f(c2)) {
    return order ? -1 : 1;
  } else {
    return 0;
  }
}
