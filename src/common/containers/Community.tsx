import Paper from '@material-ui/core/Paper';
import { sum } from 'lodash';
import { filter, flow, orderBy, slice } from 'lodash/fp';
import * as React from 'react';
import Helmet from 'react-helmet';
import { RouteComponentProps, withRouter } from 'react-router';

import Title from '../components/Title';
import RecentCardsCarousel from '../components/cards/RecentCardsCarousel';
import CommunityUser from '../components/users/CommunityUser';
import * as w from '../types';
import { getMostUsedCards, getUsers } from '../util/firebase';
import Background from '../components/Background';
import SpinningGears from '../components/SpinningGears';

interface CommunityState {
  mostPopularCards?: w.CardInStore[]
  users: w.User[]
}

class Community extends React.Component<RouteComponentProps, CommunityState> {
  public state: CommunityState = {
    users: []
  };

  public async componentDidMount(): Promise<void> {
    await this.loadData();
  }

  public render(): JSX.Element {
    const { history } = this.props;
    const { mostPopularCards, users } = this.state;

    return (
      <div>
        <Background asset="compressed/IMG_3006.jpg" opacity={0.25} />
        <Helmet title="Community" />
        <Title text="Community" />

        <div style={{ margin: 20 }}>
          <div>
            <div>
              <Paper
                style={{
                  display: 'inline-block',
                  padding: '5px 15px',
                  fontSize: 20,
                  fontFamily: '"Carter One", "Carter One-fallback"'
                }}
              >
                Most popular cards
                </Paper>
            </div>

            {mostPopularCards
              ? <RecentCardsCarousel cardsToShow={mostPopularCards} history={history} />
              : <SpinningGears />
            }
          </div>
          <div>
            <Paper
              style={{
                display: 'inline-block',
                padding: '5px 15px',
                fontSize: 20,
                fontFamily: '"Carter One", "Carter One-fallback"'
              }}
            >
              Most active players
            </Paper>
          </div>

          <div
            style={{
              marginTop: 20,
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'flex-start'
            }}
          >
            {users.length > 0
              ? users.map((user, i) =>
                <CommunityUser key={i} user={user} history={history} />
              )
              : <div style={{ margin: '0 auto' }}><SpinningGears /></div>
            }
          </div>
        </div>
      </div>
    );
  }

  private loadData = async (): Promise<void> => {
    const allUsers = await getUsers();
    const users: w.User[] = flow(
      filter((u: w.User) => !!u.info && !!u.statistics && u.statistics['cardsCreated'] > 0),
      orderBy((u: w.User) => sum(Object.values(u.statistics!)), 'desc'),
      slice(0, 10)
    )(allUsers);

    // Look up the 15 cards that are in the most decks and sets
    const mostPopularCards = await getMostUsedCards(15);

    this.setState({
      users,
      mostPopularCards
    });
  }
}

export default withRouter(Community);
