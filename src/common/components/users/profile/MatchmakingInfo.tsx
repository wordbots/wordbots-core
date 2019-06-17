import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import { chain as _, isNil } from 'lodash';
import * as React from 'react';

import * as w from '../../../types';
import { GameFormat } from '../../../util/formats';
import Title from '../../Title';

import { styles } from './PlayerInfo';

interface FormatResults {
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
  get resultsByFormat(): Record<string, FormatResults> {
    const { games, userId } = this.props;

    return _(games)
      .groupBy((g: w.SavedGame) => JSON.stringify(GameFormat.decode(g.format).serialized()))
      .mapValues((gamesInFormat: w.SavedGame[]) => ({
        numGames: gamesInFormat.length,
        numWins: gamesInFormat.filter((g) => g.winner && g.players[g.winner] === userId).length,
        numLosses: gamesInFormat.filter((g) => g.winner && g.players[g.winner] !== userId).length
      }))
      .toPairs()
      .sortBy(([_format, results]) => -results.numGames)
      .fromPairs()
      .value();
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
                <div className={classes.playerInfo}>
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
    return Object.entries(this.resultsByFormat).map(([serializedFormat, { numWins, numLosses }]) => {
      const format: GameFormat = GameFormat.decode(JSON.parse(serializedFormat));
      return (
        <div key={format.name} className={classes.playerInfoItem}>
          <div className={classes.playerInfoKey}>{format.rendered()}</div>
          <div className={classes.playerInfoValue}>{numWins} W • {numLosses} L • {(numWins / (numWins + numLosses) * 100).toFixed(1)}%</div>
        </div>
      );
    });
  }
}

export default withStyles(styles)(MatchmakingInfo);
