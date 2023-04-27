import CircularProgress from '@material-ui/core/CircularProgress';
import List from '@material-ui/core/List';
import { withStyles } from '@material-ui/core/styles';
import { WithStyles } from '@material-ui/core/styles/withStyles';
import { isNil } from 'lodash';
import * as React from 'react';

import * as w from '../../../types';
import Title from '../../Title';

import { styles } from './PlayerInfo';
import RecentGame from './RecentGame';

interface RecentGamesProps {
  games?: w.SavedGame[]
  playerNames?: Record<string, string>
  userId: string
}

class RecentGames extends React.PureComponent<RecentGamesProps & WithStyles> {
  public render(): JSX.Element {
    const { userId, games, playerNames, classes } = this.props;

    return (
      <div className={classes.root}>
        <Title text="Recent Games" small />
        { isNil(games) ?
          <div className={classes.progressContainer}>
            <CircularProgress />
          </div> :
          (
            (games.length > 0 && playerNames) ?
              <List>
                {games
                  .filter((game) => game.timestamp)
                  .map((game, i) =>
                    <RecentGame key={i} game={game} userId={userId} playerNames={playerNames} classes={classes} />
                  )}
              </List> :
              <div className={classes.noGames}>NO GAMES PLAYED<br />(YET)</div>
          )
        }
      </div>
    );
  }
}

export default withStyles(styles)(RecentGames);
