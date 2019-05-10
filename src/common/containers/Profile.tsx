import Paper from '@material-ui/core/Paper';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import { History } from 'history';
import { flatten, uniq, zipObject } from 'lodash';
import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { match as Match } from 'react-router';
import { withRouter } from 'react-router-dom';
import { Dispatch } from 'redux';

import * as collectionActions from '../actions/collection';
import RecentCardsCarousel from '../components/cards/RecentCardsCarousel';
import Title from '../components/Title';
import MatchmakingInfo from '../components/users/profile/MatchmakingInfo';
import PlayerInfo from '../components/users/profile/PlayerInfo';
import RecentGames from '../components/users/profile/RecentGames';
import * as w from '../types';
import {
  getCardsCreatedCountByUserId,
  getDecksCreatedCountByUserId,
  getRecentGamesByUserId,
  getUserNamesByIds
} from '../util/firebase';

interface ProfileDispatchProps {
  onOpenForEditing: (card: w.CardInStore) => void
}

type ProfileProps = ProfileDispatchProps & WithStyles & {
  history: History,
  match: Match<{ userId?: string }>
};

interface ProfileState {
  userId?: string
  userName?: string
  recentGames?: w.SavedGame[]
  playerNames?: Record<string, string>
  playerInfo?: {
    cardsCreated: number,
    decksCreated: number,
    gamesPlayed: number,
    winRate: string
  }
}

export function mapDispatchToProps(dispatch: Dispatch): ProfileDispatchProps {
  return {
    onOpenForEditing: (card) => {
      dispatch(collectionActions.openForEditing(card));
    }
  };
}

const styles: Record<string, CSSProperties> = {
  container: {
    margin: 20
  },
  paperContainer: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  gridItem: {
    width: 'calc((100% / 3) - (40px / 3))',
    height: 400
  },
  recentCardsContainer: {
    marginTop: 20,
    padding: '5px 25px'
  }
};

class Profile extends React.Component<ProfileProps, ProfileState> {
  public state: ProfileState = {};

  public async componentDidMount(): Promise<void> {
    this.loadProfileData();
  }

  public async componentDidUpdate(nextProps: ProfileProps): Promise<void> {
    // Did the userId change?
    if (nextProps.match.params.userId !== this.props.match.params.userId) {
      this.loadProfileData();
    }
  }

  public render(): JSX.Element {
    const { classes } = this.props;
    const { recentGames, playerNames, playerInfo, userId, userName } = this.state;

    const title = userName ? `${userName}'s Profile` : 'Profile';

    return (
      <div>
        <Helmet title="Profile"/>
        <Title text={title} />

        <div className={classes.container}>
          <div className={classes.paperContainer}>
            <Paper className={classes.gridItem}>
              <PlayerInfo playerInfo={playerInfo} />
            </Paper>
            <Paper className={classes.gridItem}>
              <MatchmakingInfo userId={userId} />
            </Paper>
            <Paper className={classes.gridItem}>
              <RecentGames
                recentGames={recentGames}
                playerNames={playerNames}
                userId={userId}
              />
            </Paper>
          </div>
          <Paper className={classes.recentCardsContainer}>
            { userId &&
              <RecentCardsCarousel
                key={userId}
                userId={userId}
                history={this.props.history}
                onOpenForEditing={this.props.onOpenForEditing}
              />
            }
          </Paper>
        </div>
      </div>
    );
  }

  private async loadProfileData(): Promise<void> {
    try {
      const { userId } = this.props.match.params;
      if (!userId) {
        throw new Error('No userId in URL');
      }

      const [userName] = await getUserNamesByIds([userId]);
      this.setState({ userId, userName });

      const recentGames = await getRecentGamesByUserId(userId);
      this.loadRecentGamesData(recentGames);
      this.loadPlayerInfoData(userId, recentGames);
    } catch (err) {
      // Most likely reason is that userId is undefined or that user doesn't exist.
      console.error(err); // tslint:disable-line no-console
      this.props.history.push('/');
    }
  }

  private async loadRecentGamesData(recentGames: w.SavedGame[]): Promise<void> {
    const playerIds = uniq(flatten(recentGames.map((recentGame) => Object.values(recentGame.players)))).filter((playerId) => !playerId.startsWith('guest'));
    const playerNamesList = await getUserNamesByIds(playerIds);
    const playerNames = zipObject(playerIds, playerNamesList);

    this.setState({
      recentGames,
      playerNames
    });
  }

  private async loadPlayerInfoData(userId: string, recentGames: w.SavedGame[]): Promise<void> {
    const cardsCreated = await getCardsCreatedCountByUserId(userId);
    const decksCreated = await getDecksCreatedCountByUserId(userId);
    const gamesPlayed = recentGames.length;
    const winRate = this.getWinRate(userId, recentGames);

    this.setState({
      playerInfo: {
        cardsCreated,
        decksCreated,
        gamesPlayed,
        winRate
      }
    });
  }

  private getWinRate = (userId: string, recentGames: w.SavedGame[]) => {
    type GameWithWinner = Array<w.SavedGame & { winner: w.PlayerColor }> ;
    const games: GameWithWinner = recentGames.filter((game) => game.winner) as GameWithWinner;

    const numGamesWon = games.reduce((gamesWon, recentGame) => {
      const wonGame = recentGame.players[recentGame.winner] === userId ? 1 : 0;
      return gamesWon + wonGame;
    }, 0);

    return `${((numGamesWon / games.length) * 100).toFixed(2)}%`;
  }
}

// TO-DO: replace this with decorators
export default withRouter(connect(() => ({}), mapDispatchToProps)(withStyles(styles)(Profile)));
