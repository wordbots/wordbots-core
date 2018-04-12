import React, { Component } from 'react';
import { object, bool } from 'prop-types';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';

import Hand from './Hand';
import PlayerName from './PlayerName';
import EnergyCount from './EnergyCount';
import Deck from './Deck';
import DiscardPile from './DiscardPile';

export default class PlayerArea extends Component {
  static propTypes = {
    gameProps: object,
    opponent: bool
  };

  state = {
    discardOpen: false
  };

  get color() {
    const { opponent, gameProps: { player } } = this.props;

    if (opponent) {
      return (player === 'blue') ? 'orange' : 'blue';
    } else {
      return (player === 'neither') ? 'orange' : player;
    }
  }

  get styles() {
    const { opponent, gameProps } = this.props;

    return {
      container: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'absolute',
        overflow: 'hidden',
        padding: 20,
        bottom: opponent ? 'auto' : 0,
        top: opponent ? 0 : 'auto',
        width: '100%',
        boxSizing: 'border-box'
      },
      icon: {
        verticalAlign: 'middle',
        color: 'white'
      },
      discardContainer: {
        display: 'flex'
      },
      discard: {
        marginRight: 8,
        marginTop: gameProps.isSandbox ? -24 : -36,
        transform: 'rotate(-90deg)',
        transformOrigin: '100% 100%',
        height: 36,
        width: 210
      }
    };
  }

  handleSelectCard = (idx) => this.props.gameProps.onSelectCard(idx, this.color);

  handleOpenDiscardPile = () => {
    if (this.props.gameProps[`${this.color}DiscardPile`].length > 0) {
      this.setState({ discardOpen: true });
    }
  };

  handleCloseDiscardPile = () => this.setState({ discardOpen: false });

  render() {
    const { opponent, gameProps } = this.props;
    const color = this.color;

    return (
      <div
        className="background"
        style={this.styles.container}
      >
        <PlayerName
          opponent={opponent}
          color={color}
          playerName={(gameProps.player === color && !gameProps.isSandbox) ? 'You' : gameProps.usernames[color]} />
        <EnergyCount
          color={color}
          energy={gameProps[`${color}Energy`]} />
        <Hand
          // curved
          opponent={opponent}
          selectedCard={gameProps.selectedCard}
          targetableCards={gameProps.target.possibleCards}
          isActivePlayer={gameProps.player === color || gameProps.isSandbox}
          cards={gameProps[`${color}Hand`]}
          sandbox={gameProps.isSandbox}
          status={gameProps.status}
          tutorialStep={gameProps.tutorialStep}
          onSelectCard={this.handleSelectCard}
          onTutorialStep={gameProps.onTutorialStep} />

        <div
          className="background"
          style={this.styles.discardContainer}
        >
          <RaisedButton
            secondary
            label={`Discard Pile (${gameProps[`${color}DiscardPile`].length})`}
            onTouchTap={this.handleOpenDiscardPile}
            style={this.styles.discard}
            disabled={gameProps[`${color}DiscardPile`].length === 0}/>
          <Deck deck={gameProps[`${color}Deck`]} reveal={gameProps.isSandbox} opponent={opponent} />
        </div>

        <Dialog
          title="Discard Pile"
          modal={false}
          open={this.state.discardOpen}
          contentStyle={{ width: 700 }}
          bodyStyle={{ overflow: 'auto' }}
          onRequestClose={this.handleCloseDiscardPile}
        >
          <DiscardPile cards={gameProps[`${color}DiscardPile`]} />
        </Dialog>
      </div>
    );
  }
}
