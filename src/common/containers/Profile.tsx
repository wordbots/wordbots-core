import Paper from '@material-ui/core/Paper';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import { compact, flatten, identity, uniq, zipObject } from 'lodash';
import { countBy, filter, flatMap, flow, map, sortBy, toPairs } from 'lodash/fp';
import * as React from 'react';
import Helmet from 'react-helmet';
import { RouteComponentProps } from 'react-router';
import { withRouter } from 'react-router-dom';

import Background from '../components/Background';
import CardGrid from '../components/cards/CardGrid';
import RecentCardsCarousel from '../components/cards/RecentCardsCarousel';
import Title from '../components/Title';
import MatchmakingInfo from '../components/users/profile/MatchmakingInfo';
import PlayerInfo from '../components/users/profile/PlayerInfo';
import RecentGames from '../components/users/profile/RecentGames';
import ProfileLink from '../components/users/ProfileLink';
import * as w from '../types';
import {
  getNumCardsCreatedCountByUserId,
  getNumDecksCreatedCountByUserId,
  getNumSetsCreatedCountByUserId,
  getGamesByUser,
  getUserNamesByIds,
  setStatistic,
  mostRecentCards
} from '../util/firebase';

type ProfileProps = RouteComponentProps<{ userId: string }> & WithStyles;

interface ProfileState {
  cardsDisplayMode: 'recent' | 'all'
  userId?: string
  userName?: string
  games?: w.SavedGame[]
  cards?: w.CardInStore[]
  playerNames?: Record<string, string>
  playerInfo?: {
    cardsCreated: number
    decksCreated: number
    setsCreated: number
    gamesPlayed: number
    favoriteOpponent?: React.ReactNode
  }
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
  public state: ProfileState = {
    cardsDisplayMode: 'recent'
  };

  public async componentDidMount(): Promise<void> {
    this.loadProfileData();
  }

  public async componentDidUpdate(prevProps: ProfileProps): Promise<void> {
    // Did the userId change?
    if (prevProps.match.params.userId !== this.props.match.params.userId) {
      this.setState(({
        userId: undefined,
        userName: undefined,
        games: undefined,
        playerNames: undefined,
        playerInfo: undefined
      }), this.loadProfileData);
    }
  }

  public render(): JSX.Element {
    const { classes, history } = this.props;
    const { cardsDisplayMode, games, cards, playerNames, playerInfo, userId, userName } = this.state;

    const title = userName ? `${userName}'s Profile` : 'Profile';

    return (
      <div>
        <Background asset="compressed/IMG_3006.jpg" opacity={0.15} />
        <Helmet title="Profile"/>
        <Title text={title} />

        <div className={classes.container}>
          <div className={classes.paperContainer}>
            <Paper className={classes.gridItem}>
              <PlayerInfo playerInfo={playerInfo} />
            </Paper>
            <Paper className={classes.gridItem}>
              <MatchmakingInfo
                userId={userId}
                games={games}
              />
            </Paper>
            <Paper className={classes.gridItem}>
              <RecentGames
                games={games}
                playerNames={playerNames}
                userId={userId}
              />
            </Paper>
          </div>
          {(userId && cards) && (
            <div key={userId} className={classes.recentCardsContainer}>
              <div
                style={{
                  margin: 10,
                  color: '#999',
                  fontSize: 20,
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  textAlign: 'center'
                }}
              >
                { cardsDisplayMode === 'recent' ? 'Most recently created cards ' : 'All created cards ' }
                <a
                  className="underline"
                  onClick={this.toggleCardsDisplayMode}
                  style={{
                    fontSize: 14,
                    textTransform: 'none'
                  }}
                >
                  { cardsDisplayMode === 'recent' ? '[show all cards]' : '[show most recent cards]' }
                </a>
              </div>
              {
                cardsDisplayMode === 'recent'
                ? <RecentCardsCarousel cardsToShow={cards.slice(0, 15)} history={history} />
                : (
                  <CardGrid
                    cards={cards || []}
                    selectedCardIds={[]}
                    selectable={false}
                    onCardClick={this.handleClickCard}
                  />
                )
              }
            </div>
          )}
        </div>
      </div>
    );
  }

  private toggleCardsDisplayMode = (): void => {
    this.setState(({ cardsDisplayMode }) => ({
      cardsDisplayMode: cardsDisplayMode === 'all' ? 'recent' : 'all'
    }));
  }

  private handleClickCard = (cardId: w.CardId) => {
    this.props.history.push(`/card/${cardId}`);
  }

  private async loadProfileData(): Promise<void> {
    try {
      const { userId } = this.props.match.params;
      if (!userId) {
        throw new Error('No userId in URL');
      }

      const [userName] = await getUserNamesByIds([userId]);
      this.setState({ userId, userName });

      const games = await getGamesByUser(userId);
      this.loadGamesData(games);
      this.loadPlayerInfoData(userId, games);

      this.setState({
        cards: await mostRecentCards(userId)
      });
    } catch (error) {
      // Most likely reason is that userId is undefined or that user doesn't exist.
      console.error(error); // eslint-disable-line  no-console
      this.props.history.push('/');
    }
  }

  private async loadGamesData(games: w.SavedGame[]): Promise<void> {
    const playerIds = compact(uniq(flatten(games.map((g) => Object.values(g.players)))).filter((pid) => pid && !pid.startsWith('guest')));
    const playerNamesList = await getUserNamesByIds(playerIds);
    const playerNames = zipObject(playerIds, playerNamesList);

    this.setState({
      games,
      playerNames
    });
  }

  private async loadPlayerInfoData(userId: string, games: w.SavedGame[]): Promise<void> {
    const cardsCreated = await getNumCardsCreatedCountByUserId(userId);
    const decksCreated = await getNumDecksCreatedCountByUserId(userId);
    const setsCreated = await getNumSetsCreatedCountByUserId(userId);
    const gamesPlayed = games.length;

    // TODO break this chunk out into its own method
    const favoriteOpponentIds: string[] = flow(
      flatMap((g: w.SavedGame) => Object.values(g.players)),
      countBy(identity),
      toPairs,
      sortBy(([_playerId, count]) => -count),
      map(([playerId, _count]) => playerId),
      filter((playerId: string) => playerId !== userId && !playerId.startsWith('guest'))
    )(games);
    const [favoriteOpponentName] = await getUserNamesByIds(favoriteOpponentIds.slice(0, 1));
    const favoriteOpponent = favoriteOpponentName && <ProfileLink className="underline" uid={favoriteOpponentIds[0]} username={favoriteOpponentName} />;

    this.setState({
      playerInfo: {
        cardsCreated,
        decksCreated,
        setsCreated,
        gamesPlayed,
        favoriteOpponent
      }
    });


    // TODO remove these once all users' statistics are consistent
    setStatistic(userId, "cardsCreated", cardsCreated);
    setStatistic(userId, "decksCreated", decksCreated);
    setStatistic(userId, "setsCreated", setsCreated);
    setStatistic(userId, "gamesPlayed", gamesPlayed);
  }
}

export default withStyles(styles)(withRouter(Profile));
