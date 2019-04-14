import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import { isNil, upperCase } from 'lodash';
import * as React from 'react';

import Title from '../../Title';

interface PlayerInfoProps {
  playerInfo: {
    cardsCreated: number,
    decksCreated: number,
    gamesPlayed: number,
    winRate: string
  }
}

const styles: Record<string, CSSProperties> = {
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

class PlayerInfo extends React.Component<PlayerInfoProps & WithStyles> {
  public render(): JSX.Element {
    const { playerInfo, classes } = this.props;

    return (
      <div className={classes.root}>
        <Title text="Player Stats" small />
        { isNil(playerInfo) ?
          <div className={classes.progressContainer}>
            <CircularProgress />
          </div> :
          <div className={classes.playerInfo}>{this.renderPlayerInfo()}</div>
        }
      </div>
    );
  }

  private renderPlayerInfo = () => {
    const { playerInfo, classes } = this.props;

    return Object.keys(playerInfo).map((playerInfoKey) => (
      <div key={playerInfoKey} className={classes.playerInfoItem}>
        <div className={classes.playerInfoKey}>{upperCase(playerInfoKey)}</div>
        <div className={classes.playerInfoValue}>{playerInfo[playerInfoKey as keyof PlayerInfoProps['playerInfo']]}</div>
      </div>
    ));
  }
}

export default withStyles(styles)(PlayerInfo);
