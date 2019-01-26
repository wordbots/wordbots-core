import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { History } from 'history';
import * as fb from 'firebase';
import { Button, Paper } from '@material-ui/core';
import { withStyles, WithStyles } from '@material-ui/core/styles';

import * as w from '../../common/types';
import Title from '../components/Title';
import MustBeLoggedIn from '../components/users/MustBeLoggedIn';
import { compose } from 'redux';

interface SetsStateProps {
  sets: w.Set[]
  user: fb.User | null
}

type SetsProps = SetsStateProps & { history: History } & WithStyles;

function mapStateToProps(state: w.State): SetsStateProps {
  return {
    sets: state.collection.sets,
    user: state.global.user
  };
}

// TODO this is just a barebones toy component
class SetSummary extends React.Component<{ set: w.Set }> {
  public render(): JSX.Element {
    const { cards, description, metadata, name } = this.props.set;
    return (
      <Paper style={{ padding: 10, marginBottom: 5 }}>
        <div>
          <strong>{name}</strong> by {metadata.authorName}
        </div>
        <div>
        {description}
        </div>
        <div>
          [Show {cards.length} cards]
        </div>
      </Paper>
    );
  }
}

class Sets extends React.Component<SetsProps> {
  public static styles = {
    newSetButtonLabel: {
      fontFamily: 'Carter One'
    }
  };

  get publishedSets(): w.Set[] {
    const { sets } = this.props;
    return sets.filter((set) => set.metadata.isPublished);
  }

  get userSets(): w.Set[] {
    const { sets, user } = this.props;
    return user ? sets.filter((set) => set.metadata.authorId === user.uid) : [];
  }

  public render(): JSX.Element {
    const { user, classes } = this.props;
    return (
      <div>
        <Helmet title="Sets" />
        <Title text="Sets" />

        <div style={{ margin: 20 }}>
          <MustBeLoggedIn loggedIn={!!user}>
            <Button
              variant="contained"
              color="secondary"
              classes={{
                label: classes.newSetButtonLabel
              }}
              onClick={this.handleCreateSet}
            >
              New Set
            </Button>
          </MustBeLoggedIn>
          {
            this.publishedSets.length > 0 &&
              <div>
                <h2>Top published sets <i>({ this.publishedSets.length })</i></h2>
                { this.publishedSets.map((set) => <SetSummary key={set.id} set={set} />) }
              </div>
          }
          {
            this.userSets.length > 0 &&
              <div>
                <h2>Your sets <i>({ this.userSets.length })</i></h2>
                { this.userSets.map((set) => <SetSummary key={set.id} set={set} />) }
              </div>
          }
        </div>
      </div>
    );
  }

  private handleCreateSet = () => {
    this.props.history.push('/sets/new');
  };
}

export default compose(
  withRouter,
  connect(mapStateToProps),
  withStyles(Sets.styles)
)(Sets);
