import { fromPairs, sum } from 'lodash';
import { filter, flow, orderBy, slice } from 'lodash/fp';
import { Paper } from 'material-ui';
import * as React from 'react';
import Helmet from 'react-helmet';
import { RouteComponentProps, withRouter } from 'react-router';

import Card from '../components/card/Card';
import Title from '../components/Title';
import ProfileLink from '../components/users/ProfileLink';
import * as w from '../types';
import { getUsers, mostRecentCards } from '../util/firebase';

interface CommunityState {
  users: w.User[]
  mostRecentCardByUserId: Record<string, w.CardInStore>
}

class Community extends React.Component<RouteComponentProps, CommunityState> {
  public state: CommunityState = {
    users: [],
    mostRecentCardByUserId: {}
  };

  public async componentDidMount(): Promise<void> {
    await this.loadData();
  }

  public render(): JSX.Element {
    const { users } = this.state;

    return (
      <div>
        <Helmet title="Community"/>
        <Title text="Community" />

        <div>
          <Paper
            style={{
              display: 'inline-block',
              marginLeft: 20,
              marginTop: 20,
              padding: '5px 15px',
              fontSize: 20,
              fontFamily: 'Carter One'
            }}
          >
            Most active players
          </Paper>
        </div>

        <div>
          {users.map(this.renderUser)}
        </div>
      </div>
    );
  }

  private renderUser = (user: w.User): JSX.Element => {
    const { mostRecentCardByUserId } = this.state;

    const info = user.info!;
    const statistics = user.statistics!;
    const card: w.CardInStore | undefined = mostRecentCardByUserId[info.uid];

    return (
      <Paper key={info.uid} style={{ float: 'left', width: 400, margin: 20, padding: 10 }}>
        <div style={{ float: 'left', width: '48%' }}>
          <ProfileLink uid={info.uid} username={info.displayName!} style={{ fontWeight: 'bold' }} />
          <p>{statistics['cardsCreated'] || 0} cards created</p>
          <p>{statistics['decksCreated'] || 0} decks created</p>
          <p>{statistics['setsCreated'] || 0} sets created</p>
          <p>{statistics['gamesPlayed'] || 0} games played</p>
        </div>
        {card && (
          <div style={{ float: 'right', width: '48%' }}>
            {Card.fromObj(card, { onCardClick: () => { this.handleClickCard(card); }})}
            <span style={{ color: '#999', fontSize: '0.85em' }}>Most recent card created</span>
          </div>
        )}

      </Paper>
    );
  }

  private loadData = async (): Promise<void> => {
    const allUsers = await getUsers();
    const users: w.User[] = flow(
      filter((u: w.User) => !!u.info && !!u.statistics && u.statistics['cardsCreated'] > 0),
      orderBy((u: w.User) => sum(Object.values(u.statistics!)), 'desc'),
      slice(0, 10)
    )(allUsers);

    this.setState({ users }, () => {
      users.forEach(this.loadCardForUser);
    });
  }

  private loadCardForUser = async (user: w.User): Promise<void> => {
    const uid = user.info!.uid;
    const cards = await mostRecentCards(uid, 1);

    if (cards.length > 0) {
      this.setState(({ mostRecentCardByUserId }) => ({
        mostRecentCardByUserId: { ...mostRecentCardByUserId, [uid]: cards[0] }
      }));
    }
  }

  private handleClickCard = (card: w.CardInStore) => {
    this.props.history.push(`/card/${card.id}`, { card });
  }
}

export default withRouter(Community);
