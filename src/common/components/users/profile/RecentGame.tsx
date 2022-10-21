import Avatar from '@material-ui/core/Avatar';
import Icon from '@material-ui/core/Icon';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import { WithStyles } from '@material-ui/core/styles/withStyles';
import LayersIcon from '@material-ui/icons/Layers';
import DashboardIcon from '@material-ui/icons/Dashboard';
import { isNil, isString, toUpper } from 'lodash';
import * as React from 'react';

import * as w from '../../../types';
import { GameFormat } from '../../../util/formats';
import { isGuest } from '../../../util/multiplayer';
import ProfileLink from '../ProfileLink';

interface RecentGameProps {
  game: w.SavedGame
  userId: string
  playerNames: Record<string, string>
}

export default function RecentGame(props: RecentGameProps & WithStyles): JSX.Element | null {
  const { game, userId, playerNames, classes } = props;
  const { winner } = game;

  const opponentId = Object.values(game.players).find((player) => player !== userId)!;
  const opponent = (isNil(opponentId) || isGuest(opponentId)) ? 'Guest' : (playerNames[opponentId] || playerNames[userId]);
  const outcome = winner ? (winner === 'draw' ? 'draw' : (game.players[winner] === userId ? 'victory' : 'defeat')) : '';
  const timestamp = new Date(game.timestamp).toLocaleDateString();

  const formatIcons = {
    'normal': 'player',
    'sharedDeck': 'double-team',
    'builtinOnly': 'player-teleport'
  };

  return (
    <ListItem className={classes.game}>
      <ListItemAvatar>
        <Avatar>
          {
            isString(game.format)
              ? <Icon className={`ra ra-${isString(game.format) && formatIcons[game.format]}`} />
              : game.format._type === 'set'
                ? <LayersIcon />
                : <DashboardIcon />
          }
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={<ProfileLink uid={opponentId} username={opponent} />}
        secondary={<span>{GameFormat.decode(game.format).rendered()} - {timestamp}</span>}
      />
      <ListItemText
        primaryTypographyProps={{ className: classes[outcome] }}
        primary={toUpper(outcome)}
        style={{ minWidth: 58 }}
      />
    </ListItem>
  );
}
