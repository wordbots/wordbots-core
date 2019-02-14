import * as React from 'react';
import Helmet from 'react-helmet';
import { compose, Dispatch, AnyAction } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { History } from 'history';
import * as fb from 'firebase';
import { Button } from '@material-ui/core';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import { orderBy } from 'lodash';

import * as w from '../types';
import Title from '../components/Title';
import SetSummary from '../components/cards/SetSummary';
import MustBeLoggedIn from '../components/users/MustBeLoggedIn';
import * as collectionActions from '../actions/collection';

interface SetsStateProps {
  sets: w.Set[]
  user: fb.User | null
}

interface SetsDispatchProps {
  onDeleteSet: (setId: string) => void
  onEditSet: (setId: string) => void
}

type SetsProps = SetsStateProps & SetsDispatchProps & { history: History } & WithStyles;

function mapStateToProps(state: w.State): SetsStateProps {
  return {
    sets: state.collection.sets,
    user: state.global.user
  };
}

function mapDispatchToProps(dispatch: Dispatch<AnyAction>): SetsDispatchProps {
  return {
    onDeleteSet: (setId: string) => {
      dispatch(collectionActions.deleteSet(setId));
    },
    onEditSet: (setId: string) => {
      dispatch(collectionActions.editSet(setId));
    }
  };
}

class Sets extends React.Component<SetsProps> {
  public static styles = {
    newSetButtonLabel: {
      fontFamily: 'Carter One'
    }
  };

  get publishedSets(): w.Set[] {
    const { sets } = this.props;
    return orderBy(sets.filter((set) => set.metadata.isPublished), 'metadata.numDecksCreated', 'desc');
  }

  get userSets(): w.Set[] {
    const { sets, user } = this.props;
    return user ? orderBy(sets.filter((set) => set.metadata.authorId === user.uid), 'metadata.lastModified', 'desc') : [];
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
                { this.publishedSets.map(this.renderSetSummary) }
              </div>
          }
          {
            this.userSets.length > 0 &&
              <div>
                <h2>Your sets <i>({ this.userSets.length })</i></h2>
                { this.userSets.map(this.renderSetSummary) }
              </div>
          }
        </div>
      </div>
    );
  }

  private renderSetSummary = (set: w.Set): JSX.Element => (
    <SetSummary
      key={set.id}
      set={set}
      user={this.props.user}
      onDeleteSet={() => this.props.onDeleteSet(set.id)}
      onEditSet={() => this.handleEditSet(set.id)} />
  )

  private handleCreateSet = () => {
    this.props.history.push('/sets/new');
  }

  private handleEditSet = (setId: string) => {
    this.props.onEditSet(setId);
    this.props.history.push(`/sets/${setId}`);
  }
}

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(Sets.styles)
)(Sets);
