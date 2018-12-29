import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import * as fb from 'firebase';
import { Paper } from '@material-ui/core';

import * as w from '../../common/types';
import Title from '../components/Title';

interface SetsProps {
  sets: w.Set[]
  user: fb.User | null
}

function mapStateToProps(state: w.State): SetsProps {
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
      <Paper style={{ padding: 10 }}>
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
  get publishedSets(): w.Set[] {
    const { sets } = this.props;
    return sets.filter((set) => set.metadata.isPublished);
  }

  get userSets(): w.Set[] {
    const { sets, user } = this.props;
    return user ? sets.filter((set) => set.metadata.authorId === user.uid) : [];
  }

  public render(): JSX.Element {
    return (
      <div>
        <Helmet title="Sets" />
        <Title text="Sets" />

        <div style={{ margin: 20 }}>
          <h2>Top published sets <i>({ this.publishedSets.length })</i></h2>
          { this.publishedSets.map((set) => <SetSummary key={set.id} set={set} />) }

          <h2>Your sets <i>({ this.userSets.length })</i></h2>
          { this.userSets.map((set) => <SetSummary key={set.id} set={set} />) }
        </div>
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps)(Sets));
