import React, { Component } from 'react';
import { array, func, object } from 'prop-types';
import { shuffle } from 'lodash';

import { KEEP_DECKS_UNSHUFFLED } from '../../constants';
import { instantiateCard, cardsInDeck } from '../../util/cards';

import DeckPicker from './DeckPicker';
import GameBrowser from './GameBrowser';
import HostGame from './HostGame';

export default class CasualLobby extends Component {
  static propTypes = {
    socket: object,
    availableDecks: array,
    cards: array,

    onJoinGame: func,
    onSpectateGame: func,
    onHostGame: func
  };

  constructor(props) {
    super(props);

    this.state = {
      selectedDeck: this.props.availableDecks.length - 1
    };
  }

  get hasNoDecks() {
    return this.props.availableDecks.length === 0;
  }

  get deck() {
    const deck = this.props.availableDecks[this.state.selectedDeck];
    const cards = cardsInDeck(deck, this.props.cards).map(instantiateCard);
    return KEEP_DECKS_UNSHUFFLED ? cards : shuffle(cards);
  }

  render() {
    const skt = this.props.socket;

    return (
      <div>
        <DeckPicker
          cards={this.props.cards}
          availableDecks={this.props.availableDecks}
          selectedDeckIdx={this.state.selectedDeck}
          onChooseDeck={idx => { this.setState({selectedDeck: idx}); }} />
        <GameBrowser
          cannotJoinGame={this.hasNoDecks}
          openGames={skt.waitingPlayers}
          inProgressGames={skt.games}
          usernameMap={skt.clientIdToUsername}
          onJoinGame={(gameId, gameName) => { this.props.onJoinGame(gameId, gameName, this.deck); }}
          onSpectateGame={(gameId, gameName) => { this.props.onSpectateGame(gameId, gameName); }} />
        <HostGame
          disabled={this.hasNoDecks}
          onHostGame={gameName => { this.props.onHostGame(gameName, this.deck); }} />
      </div>
    );
  }
}
