import React, { Component } from 'react';
import { object } from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Title from '../Title.tsx';

const styles = {
  root: {
    width: '100%',
    height: '100%'
  },
  comingSoon: {
    width: '100%',
    height: 'calc(100% - 35px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 36,
    fontWeight: 100
  }
};

// eslint-disable-next-line react/prefer-stateless-function
class MatchmakingInfo extends Component {
  static propTypes = {
    classes: object
  };

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <Title text="Matchmaking" small />
        <div className={classes.comingSoon}>COMING SOON</div>
      </div>
    );
  }
}

export default withStyles(styles)(MatchmakingInfo);
