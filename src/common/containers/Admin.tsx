import * as fb from 'firebase';
import { Paper, Tab, Tabs } from '@material-ui/core';
import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Redirect, withRouter } from 'react-router';
import { TabIndicatorProps } from '@material-ui/core/Tabs/TabIndicator';

import * as w from '../types';
import { FIREBASE_CONFIG, PARSER_URL } from '../constants';
import { lookupParserVersion, normalizeCard } from '../util/cards';
import * as firebase from '../util/firebase';
import CardMigrationPanel from '../components/admin/CardMigrationPanel';
import StatisticsPanel from '../components/admin/StatisticsPanel';
import MiscUtilitiesPanel from '../components/admin/MiscUtilitiesPanel';
import UndraftableCardsPanel from '../components/admin/UndraftableCardsPanel';
import { loadFromLocalStorage, saveToLocalStorage } from '../util/browser';
import SpinningGears from '../components/SpinningGears';

interface AdminProps {
  user: fb.User | null
  version: string
}

interface AdminState {
  cards: w.CardInStore[]
  decks: w.DeckInStore[]
  games: Record<string, w.SavedGame>
  sets: w.Set[]
  users: w.User[]
  parserVersion?: { version: string, sha: string }
  tab: 'statistics' | 'cardMigration' | 'undraftableCards' | 'miscUtilities'
}

export function mapStateToProps(state: w.State): AdminProps {
  return {
    user: state.global.user,
    version: state.version
  };
}

class Admin extends React.PureComponent<AdminProps> {
  state: AdminState = {
    cards: [],
    decks: [],
    games: {},
    sets: [],
    users: [],
    tab: (loadFromLocalStorage('adminTab') as AdminState['tab'] | undefined) || 'statistics'
  };

  public componentWillMount() {
    this.loadData();
  }

  private loadData = () => {
    this.setState({
      cards: [],
      decks: [],
      games: {},
      sets: [],
      users: [],
      parserVersion: undefined
    });

    void this.fetchCards();
    void this.fetchDecks();
    void this.fetchGames();
    void this.fetchSets();
    void this.fetchUsers();
    void this.lookupParserVersion();
  }

  public render(): JSX.Element {
    const { user } = this.props;
    const { cards, decks, games, sets, users, parserVersion, tab } = this.state;
    const [version] = this.props.version.split('+');

    // Redirect away unless admin user and on localhost (only admin user has actual firebase privileges for migrations anyway!)
    if (!(window.location.hostname === 'localhost' && user?.email && ['alex.nisnevich@gmail.com', 'jacob.nisnevich@gmail.com'].includes(user.email))) {
      return <Redirect to="/" />;
    }

    return (
      <div className="helpPage">
        <Helmet title="Admin" />
        <Paper style={{ margin: 20, padding: 10 }}>
          <div><b>Parser URL:</b> {PARSER_URL}</div>
          <div><b>Firebase URL:</b> {FIREBASE_CONFIG.databaseURL}</div>
          <div><b>Game Version:</b> {version}</div>
          <div><b>Parser Version:</b> {parserVersion?.version}</div>
          <div><b>Parser SHA:</b> {parserVersion?.sha}</div>
        </Paper>
        <Paper style={{ margin: 20, padding: 10 }}>
          <Tabs
            variant="fullWidth"
            value={this.state.tab}
            onChange={this.handleChangeTab}
            style={{ width: '100%' }}
            TabIndicatorProps={{
              color: 'primary',
              style: { height: 5 } as unknown as TabIndicatorProps['style']
            }}
          >
            <Tab value="statistics" label="Statistics" />
            <Tab value="cardMigration" label="Card Migration" />
            <Tab value="undraftableCards" label="Undraftable Cards" />
            <Tab value="miscUtilities" label="Misc Utilities" />
          </Tabs>
          {
            (cards.length > 0 && decks.length > 0 && Object.keys(games).length > 0 && sets.length > 0 && users.length > 0) ?
              (
                <div style={{ padding: '10px 20px' }}>
                  {tab === 'statistics' && <StatisticsPanel cards={cards} decks={decks} games={Object.values(games)} sets={sets} users={users} />}
                  {tab === 'cardMigration' && <CardMigrationPanel cards={cards} sets={sets} parserVersion={parserVersion} reloadData={this.loadData} />}
                  {tab === 'undraftableCards' && <UndraftableCardsPanel cards={cards} reloadData={this.loadData} />}
                  {tab === 'miscUtilities' && <MiscUtilitiesPanel games={games} />}
                </div>
              ) : <SpinningGears />
          }
        </Paper>
      </div>
    );
  }

  private fetchCards = async (): Promise<void> => {
    const cards = await firebase.getCards(null);
    this.setState({ cards });
  }

  private fetchDecks = async (): Promise<void> => {
    const decks = await firebase.getAllDecks_SLOW();
    this.setState({ decks });
  }

  private fetchGames = async (): Promise<void> => {
    const games: Record<string, w.SavedGame> = await firebase.getAllGames_SLOW();
    this.setState({ games });
  }

  private fetchSets = async (): Promise<void> => {
    const setsUnnormalized = await firebase.getSets();
    const sets = setsUnnormalized.map((set) => ({ ...set, cards: set.cards.map((c) => normalizeCard(c)) }));
    this.setState({ sets });
  }

  private fetchUsers = async (): Promise<void> => {
    const users = await firebase.getUsers();
    this.setState({ users });
  }

  private lookupParserVersion = async (): Promise<void> => {
    this.setState({
      parserVersion: await lookupParserVersion()
    });
  }

  private handleChangeTab = (_evt: React.ChangeEvent<unknown>, value: string) => {
    saveToLocalStorage('adminTab', value);
    this.setState({ tab: value as AdminState['tab'] });
  }
}

export default withRouter(connect(mapStateToProps)(Admin));
