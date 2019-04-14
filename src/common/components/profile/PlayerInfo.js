import React, { Component } from 'react';
import { object } from 'prop-types';
import { isNil, upperCase } from 'lodash';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

import Title from '../Title.tsx';

const styles = {
  root: {
    width: '100%',
    height: '100%'
  },
  progressContainer: {
    height: 'calc(100% - 35px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  playerInfo: {
    height: 'calc(100% - 35px)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    padding: '50px 0',
    boxSizing: 'border-box'
  },
  playerInfoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 24
  },
  playerInfoKey: {
    width: '60%',
    textAlign: 'right',
    fontWeight: 100
  },
  playerInfoValue: {
    width: '38%',
    color: '#555',
    fontWeight: 700
  }
};

// eslint-disable-next-line react/prefer-stateless-function
class PlayerInfo extends Component {
  static propTypes = {
    playerInfo: object,
    classes: object
  };

  renderPlayerInfo = (playerInfo) => {
    const { classes } = this.props;

    return Object.keys(playerInfo).map((playerInfoKey) => (
      <div key={playerInfoKey} className={classes.playerInfoItem}>
        <div className={classes.playerInfoKey}>{upperCase(playerInfoKey)}</div>
        <div className={classes.playerInfoValue}>{playerInfo[playerInfoKey]}</div>
      </div>
    ));
  }

  render() {
    const { playerInfo, classes } = this.props;

    return (
      <div className={classes.root}>
        <Title text="Player Stats" small />
        { isNil(playerInfo) ?
          <div className={classes.progressContainer}>
            <CircularProgress />
          </div> :
          <div className={classes.playerInfo}>{this.renderPlayerInfo(playerInfo)}</div>
        }
      </div>
    );
  }
}

export default withStyles(styles)(PlayerInfo);
