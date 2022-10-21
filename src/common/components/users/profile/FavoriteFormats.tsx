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

interface FavoriteFormatsProps {
  games?: w.SavedGame[]
  userId: string
}

class FavoriteFormats extends React.PureComponent<FavoriteFormatsProps & WithStyles> {
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
              <div className={classes.favoriteFormats} style={{ justifyContent: 'flex-start' }}>
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
      <div key={format.name} className={classes.playerInfoItem} style={{ margin: '8px 0' }}>
        <div className={classes.playerInfoKey}>{format.rendered()}</div>
        <div className={classes.playerInfoValue} style={{ fontWeight: 'normal' }}>
          <b>{(numWins / (numWins + numLosses) * 100).toFixed(1)}%</b> win rate
          <br />
          <i>(<b>{numWins}</b> wins, <b>{numLosses}</b> losses)</i>
        </div>
      </div>
    ));
  }
}

export default withStyles(styles)(FavoriteFormats);
