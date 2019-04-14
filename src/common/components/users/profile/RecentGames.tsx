import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import Icon from '@material-ui/core/Icon';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import { withStyles } from '@material-ui/core/styles';
import { CSSProperties, WithStyles } from '@material-ui/core/styles/withStyles';
import { isNil, isString, startCase, toLower } from 'lodash';
import * as React from 'react';

import * as w from '../../../types';
import { GameFormat } from '../../../util/formats';
import Title from '../../Title';

interface RecentGamesProps {
  recentGames?: w.SavedGame[]
  playerNames?: Record<string, string>
  userId: string
}

const styles: Record<string, CSSProperties> = {
  root: {
    width: '100%',
    height: '100%',
    overflowY: 'scroll'
  },
  progressContainer: {
    height: 'calc(100% - 35px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  victory: {
    color: '#4CAF50',
    fontWeight: 600,
    fontSize: 14,
    textAlign: 'right'
  },
  defeat: {
    color: '#E57373',
    fontWeight: 600,
    fontSize: 14,
    textAlign: 'right'
  }
};

class RecentGames extends React.Component<RecentGamesProps & WithStyles> {
  public render(): JSX.Element {
    const { recentGames, classes } = this.props;

    return (
      <div className={classes.root}>
        <Title text="Recent Games" small />
        { isNil(recentGames) ?
          <div className={classes.progressContainer}>
            <CircularProgress />
          </div> :
          <List>
            {recentGames.map(this.renderRecentGame)}
          </List>
        }
      </div>
    );
  }

  private renderRecentGame = (recentGame: w.SavedGame, index: number) => {
    const { userId, playerNames, classes } = this.props;

    if (!playerNames) {
      return;
    }

    const opponentId = Object.values(recentGame.players).find((player) => player !== userId);
    const isGuest = isNil(opponentId) || opponentId.startsWith('guest');
    const opponent = isGuest ? 'Guest' : playerNames[opponentId] || playerNames[userId];
    const wasVictory = recentGame.winner && recentGame.players[recentGame.winner] === userId;
    const timestamp = new Date(recentGame.timestamp).toLocaleDateString();
    const subText = `${startCase(toLower(recentGame.type))} - ${GameFormat.decode(recentGame.format).displayName} - ${timestamp}`;

    const formatIcons = {
      'normal': 'player',
      'sharedDeck': 'double-team',
      'builtinOnly': 'player-teleport'
    };

    return (
      <ListItem key={index} className={classes.recentGame}>
        <ListItemAvatar>
          <Avatar>
            <Icon className={`ra ra-${isString(recentGame.format) && formatIcons[recentGame.format]}`}/>
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={opponent} secondary={subText} />
        <ListItemText
          primaryTypographyProps={{
            className: wasVictory ? classes.victory : classes.defeat
          }}
          primary={wasVictory ? 'VICTORY' : 'DEFEAT'}
        />
      </ListItem>
    );
  }
}

export default withStyles(styles)(RecentGames);
