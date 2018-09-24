import React, { Component } from 'react';
import { object, func } from 'prop-types';
import { withRouter } from 'react-router-dom';
import { zipObject, uniq } from 'lodash';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';

import PlayerInfo from '../components/profile/PlayerInfo';
import MatchmakingInfo from '../components/profile/MatchmakingInfo';
import RecentGames from '../components/profile/RecentGames';
import RecentCardsCarousel from '../components/cards/RecentCardsCarousel';
import Title from '../components/Title';
import * as collectionActions from '../actions/collection';
import { getRecentGamesByUserId, getUserNamesByIds, getCardsCreatedCountByUserId,
         getDecksCreatedCountByUserId } from '../util/firebase.ts';

export function mapStateToProps(state) {
  return {
    user: state.global.user
  };
}

export function mapDispatchToProps(dispatch) {
  return {
    onOpenForEditing: (card) => {
      dispatch(collectionActions.openForEditing(card));
    }
  };
}

const styles = {
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

class Profile extends Component {
  constructor(props) {
    super(props);

    if (!props.match.params.userId) {
      props.history.push('/');
    }

    this.state = {
      userId: props.match.params.userId,
      recentGames: undefined,
      playerNames: undefined,
      playerInfo: undefined
    };
  }

  static propTypes = {
    user: object,
    classes: object,
    history: object,
    match: object,

    onOpenForEditing: func
  }

  async componentDidMount() {
    this.loadProfileData();
  }

  async loadProfileData() {
    const userId = this.props.match.params.userId;
    const recentGames = await getRecentGamesByUserId(userId);

    this.loadRecentGamesData(userId, recentGames);
    this.loadPlayerInfoData(userId, recentGames);
  }

  async loadRecentGamesData(userId, recentGames) {
    const playerIds = uniq(recentGames.map((recentGame) => Object.values(recentGame.players)).flat());
    const playerNamesList = await getUserNamesByIds(playerIds);
    const playerNames = zipObject(playerIds, playerNamesList);

    this.setState({ recentGames, playerNames });
  }

  async loadPlayerInfoData(userId, recentGames) {
    const playerInfo = {};

    playerInfo.cardsCreated = await getCardsCreatedCountByUserId(userId);
    playerInfo.decksCreated = await getDecksCreatedCountByUserId(userId);
    playerInfo.gamesPlayed = recentGames.length;
    playerInfo.winRate = this.getWinRate(userId, recentGames);

    this.setState({ playerInfo });
  }

  getWinRate = (userId, recentGames) => {
    const numGamesWon = recentGames.reduce((gamesWon, recentGame) => {
      const wonGame = recentGame.players[recentGame.winner] === userId ? 1 : 0;
      return gamesWon + wonGame;
    }, 0);

    return `${((numGamesWon / recentGames.length) * 100).toFixed(2)}%`;
  }

  render() {
    const { user, classes } = this.props;
    const { userId, recentGames, playerNames, playerInfo } = this.state;

    const title = user && user.displayName ? `${user.displayName}'s Profile` : 'Profile';

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
                userId={userId} />
            </Paper>
          </div>
          <Paper className={classes.recentCardsContainer}>
            { userId &&
              <RecentCardsCarousel
                userId={userId}
                history={this.props.history}
                onOpenForEditing={this.props.onOpenForEditing} />
            }
          </Paper>
        </div>
      </div>
    );
  }
}

// TO-DO: replace this with decorators
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Profile)));
