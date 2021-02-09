import Paper from '@material-ui/core/Paper';
import { sum } from 'lodash';
import { filter, flow, orderBy, slice } from 'lodash/fp';
import * as React from 'react';
import Helmet from 'react-helmet';
import { RouteComponentProps, withRouter } from 'react-router';

import Title from '../components/Title';
import CommunityUser from '../components/users/CommunityUser';
import * as w from '../types';
import { getUsers } from '../util/firebase';

interface CommunityState {
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
    const { users } = this.state;

    return (
      <div>
        <Helmet title="Community"/>
        <Title text="Community" />

        <div style={{ margin: 20 }}>
          <div>
            <Paper
              style={{
                display: 'inline-block',
                padding: '5px 15px',
                fontSize: 20,
                fontFamily: 'Carter One'
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
            {users.map((user, i) =>
              <CommunityUser key={i} user={user} history={history} />
            )}
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

    this.setState({ users });
  }
}

export default withRouter(Community);
