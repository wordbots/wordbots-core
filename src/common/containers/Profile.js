import React, { Component } from 'react';
import { object, func } from 'prop-types';
import { withRouter } from 'react-router-dom';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';

import RecentCardsCarousel from '../components/cards/RecentCardsCarousel';
import Title from '../components/Title';
import * as collectionActions from '../actions/collection';

export function mapStateToProps(state) {
  return {
    user: state.global.user
  };
}

export function mapDispatchToProps(dispatch) {
  return {
    onOpenForEditing: (card) => {
      dispatch(collectionActions.openForEditing(card));
    }
  };
}

const styles = {
  container: {
    margin: 20
  },
  paperContainer: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  gridItem: {
    width: 'calc((100% / 3) - (40px / 3))',
    height: 400
  },
  recentCardsContainer: {
    marginTop: 20,
    padding: '5px 25px'
  }
};

class Profile extends Component {
  constructor(props) {
    super(props);

    if (!props.match.params.userId) {
      props.history.push('/');
    }

    this.state = {
      userId: props.match.params.userId
    };
  }

  static propTypes = {
    user: object,
    classes: object,
    history: object,
    match: object,

    onOpenForEditing: func
  }

  render() {
    const { user, classes } = this.props;
    const { userId } = this.state;

    const title = user && user.displayName ? `${user.displayName}'s Profile` : 'Profile';

    return (
      <div>
        <Helmet title="Profile"/>
        <Title text={title} />

        <div className={classes.container}>
          <div className={classes.paperContainer}>
            <Paper className={classes.gridItem} />
            <Paper className={classes.gridItem} />
            <Paper className={classes.gridItem} />
          </div>
          <Paper className={classes.recentCardsContainer}>
            { userId &&
              <RecentCardsCarousel
                userId={userId}
                history={this.props.history}
                onOpenForEditing={this.props.onOpenForEditing} />
            }
          </Paper>
        </div>
      </div>
    );
  }
}

// TO-DO: replace this with decorators
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Profile)));
