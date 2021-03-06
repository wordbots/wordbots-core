import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import { isNil } from 'lodash';
import { flow, groupBy, map, slice, sortBy } from 'lodash/fp';
import * as React from 'react';

import * as w from '../../../types';
import { GameFormat } from '../../../util/formats';
import Title from '../../Title';

import { styles } from './PlayerInfo';

interface FormatResults {
  format: GameFormat
  numGames: number
  numWins: number
  numLosses: number
}

interface MatchmakingInfoProps {
  games?: w.SavedGame[]
  userId: string
}

// eslint-disable-next-line react/prefer-stateless-function
class MatchmakingInfo extends React.Component<MatchmakingInfoProps & WithStyles> {
  get resultsByFormat(): FormatResults[] {
    const { games, userId } = this.props;

    return flow(
      groupBy((g: w.SavedGame) => GameFormat.decode(g.format).name),
      Object.values,
      map((gamesInFormat: w.SavedGame[]) => ({
        format: GameFormat.decode(gamesInFormat[0].format),
        numGames: gamesInFormat.length,
        numWins: gamesInFormat.filter((g) => g.winner && g.winner !== 'draw' && g.players[g.winner] === userId).length,
        numLosses: gamesInFormat.filter((g) => g.winner && g.winner !== 'draw' && g.players[g.winner] !== userId).length
      })),
      sortBy((results) => -results.numGames),
      slice(0, 5)
    )(games);
  }

  public render(): JSX.Element {
    const { classes, games } = this.props;
    return (
      <div className={classes.root}>
        <Title text="Favorite Formats" small />
        { isNil(games) ?
          <div className={classes.progressContainer}>
            <CircularProgress />
          </div> :
            (
              games.length > 0 ?
                <div className={classes.playerInfo} style={{ justifyContent: 'flex-start' }}>
                  {this.renderResults()}
                </div> :
                <div className={classes.noGames}>NO GAMES PLAYED<br />(YET)</div>
            )
        }
      </div>
    );
  }

  private renderResults = () => {
    const { classes } = this.props;
    return this.resultsByFormat.map(({ format, numWins, numLosses }) => (
        <div key={format.name} className={classes.playerInfoItem} style={{ margin: 13 }}>
          <div className={classes.playerInfoKey}>{format.rendered()}</div>
          <div className={classes.playerInfoValue}>{numWins} W • {numLosses} L • {(numWins / (numWins + numLosses) * 100).toFixed(1)}%</div>
        </div>
      ));
  }
}

export default withStyles(styles)(MatchmakingInfo);
