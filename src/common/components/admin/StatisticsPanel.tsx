import * as React from 'react';

import * as w from '../../types';
import { collection as coreSet } from '../../store/cards';

import AggregatorByDate from './AggregatorByDate';

interface StatisticsPanelProps {
  cards: w.CardInStore[]
  decks: w.DeckInStore[]
  games: w.SavedGame[]
  sets: w.Set[]
  users: w.User[]
}

class StatisticsPanel extends React.PureComponent<StatisticsPanelProps> {
  public render(): JSX.Element {
    const { cards, decks, games, sets, users } = this.props;

    return (
      <div>
        <div>
          <h2>Basic statistics</h2>
          <ul>
            <li><b># cards</b> = {cards.length}
              <ul>
                <li># private = {cards.filter(c => c.metadata.isPrivate).length}</li>
                <li># banned from Everything Draft = {cards.filter(c => c.metadata.disallowInEverythingDraft).length}</li>
                <li># added to collection, created by different player = {cards.filter(c => c.metadata.ownerId !== c.metadata.source.uid).length}</li>
                <li># duplicated from another card = {cards.filter(c => c.metadata.duplicatedFromCard).length}</li>
                <li># imported from JSON = {cards.filter(c => c.metadata.importedFromJson).length}</li>
                <li># with missing or broken metadata = {cards.filter(c => !c.metadata.created).length}</li>
                <li># built-in cards (not included in above counts) = {coreSet.length}</li>
              </ul>
            </li>
            <li><b># decks</b> = {decks.length}</li>
            <li><b># sets</b> = {sets.length} ({sets.filter(s => s.metadata.isPublished).length} published)</li>
            <li><b># games played</b> = {games.length}</li>
            <li><b># users</b> = {users.length}</li>
          </ul>
        </div>
        <div>
          <h2>Aggregated by date</h2>
          <p>
            <i>
              Notes: Cards created before <a href="https://github.com/wordbots/wordbots-core/pull/1274">Oct 2019</a> have inconsistent timestamps.{' '}
                Decks created before <a href="https://github.com/wordbots/wordbots-core/pull/930">Jan 2019</a> did not record their creation time.{' '}
                Users who joined before <a href="https://github.com/wordbots/wordbots-core/commit/e12efff016ea8be14b60cd038aaf7341dd209f70">5/14/2023</a> have to log in again to populate their <code>joined</code> field.
              </i>
          </p>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around' }}>
            <AggregatorByDate label="Cards created" timestamps={cards.map((c) => c.metadata?.created || (c as any).timestamp)} />
            <AggregatorByDate label="Decks created" timestamps={decks.map((d) => d.timestamp)} />
            <AggregatorByDate label="Sets last modified" timestamps={sets.map((s) => s.metadata.lastModified)} />
            <AggregatorByDate label="Games played" timestamps={games.map((g) => g.timestamp)} />
            <AggregatorByDate label="Users joined" timestamps={users.map((u) => u.info?.joined)} />
          </div>
        </div>
      </div>
    );
  }
}

export default StatisticsPanel;
