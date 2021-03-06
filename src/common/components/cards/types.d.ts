import * as w from '../../types';

import { Layout, SortCriteria, SortOrder } from './types.enums';

export type FilterKey = 'robots' | 'events' | 'structures';

export type CardWithCount = w.CardInStore & { count: number };

export interface DeckCreationProperties {
  filters: {
    [F in FilterKey]: boolean
  }
  costRange: [number, number]
  sortCriteria: SortCriteria
  sortOrder: SortOrder
  searchText: string
  selectedCardIds: w.CardId[]
  layout: Layout
}
