import React, { Component } from 'react';
import { arrayOf, object, string } from 'prop-types';
import { isNil, startCase, toLower } from 'lodash';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import Icon from '@material-ui/core/Icon';

import Title from '../Title';

const styles = {
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

class RecentGames extends Component {
  static propTypes = {
    recentGames: arrayOf(object),
    playerNames: object,
    userId: string,
    classes: object
  };

  renderRecentGame = (recentGame, index) => {
    const { userId, playerNames, classes } = this.props;

    const opponentId = Object.values(recentGame.players).find((player) => player !== userId);
    const opponent = isNil(opponentId) || opponentId.startsWith('guest') ? 'Guest' : playerNames[opponentId] || playerNames[userId];
    const wasVictory = recentGame.players[recentGame.winner] === userId;
    const timestamp = new Date(recentGame.timestamp).toLocaleDateString();
    const subText = `${startCase(toLower(recentGame.type))} - ${startCase(recentGame.format)} - ${timestamp}`;

    const formatIcons = {
      'normal': 'player',
      'sharedDeck': 'double-team',
      'builtinOnly': 'player-teleport'
    };

    return (
      <ListItem key={index} className={classes.recentGame}>
        <ListItemAvatar>
          <Avatar>
            <Icon className={`ra ra-${formatIcons[recentGame.format]}`}/>
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={opponent} secondary={subText} />
        <ListItemText
          primaryTypographyProps={{
            className: wasVictory ? classes.victory : classes.defeat
          }}
          primary={wasVictory ? 'VICTORY' : 'DEFEAT'} />
      </ListItem>
    );
  }

  render() {
    const { recentGames, classes } = this.props;

    return (
      <div className={classes.root}>
        <Title text="Recent Games" small />
        { isNil(recentGames) ?
          <div className={classes.progressContainer}>
            <CircularProgress />
          </div> :
          <List>
            { recentGames.map(this.renderRecentGame) }
          </List>
        }
      </div>
    );
  }
}

export default withStyles(styles)(RecentGames);
