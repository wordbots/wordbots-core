import React, { Component } from 'react';
import { object, string, bool } from 'prop-types';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';

import Hand from './Hand';
import PlayerName from './PlayerName';
import EnergyCount from './EnergyCount';
import Deck from './Deck';
import DiscardPile from './DiscardPile';

class PlayerArea extends Component {
  constructor(props) {
    super(props);

    this.state = {
      discardOpen: false
    };
  }

  getColor(opponent, playerColor) {
    if (opponent) {
      return (playerColor === 'blue') ? 'orange' : 'blue';
    } else {
      return (playerColor === 'neither') ? 'orange' : playerColor;
    }
  }

  get styles() {
    const opponent = this.props.opponent;

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
      discard: {
        width: 'calc(100% - 10px)',
        marginTop: opponent ? 10 : 0,
        marginBottom: opponent ? 0 : 10
      }
    };
  }

  render() {
    const opponent = this.props.opponent;
    const gameProps = this.props.gameProps;
    const color = this.getColor(opponent, gameProps.player);

    return (
      <div style={this.styles.container}>
        <PlayerName
          opponent={opponent}
          color={color}
          playerName={gameProps.player === color ? 'You' : gameProps.usernames[color]}  />
        <EnergyCount
          color={color}
          energy={gameProps[`${color}Energy`]}
          isCurrentPlayer={gameProps.currentTurn === color} />
        <Hand
          // curved
          opponent={opponent}
          name={color}
          selectedCard={gameProps.selectedCard}
          targetableCards={gameProps.target.possibleCards}
          isActivePlayer={gameProps.player === color}
          cards={gameProps[`${color}Hand`]}
          status={gameProps.status}
          tutorialStep={gameProps.tutorialStep}
          onSelectCard={idx => gameProps.onSelectCard(idx, color)}
          onTutorialStep={gameProps.onTutorialStep} />

        <div style={{
          display: 'flex',
          flexDirection: opponent ? 'column-reverse' : 'column'
        }}>
          <RaisedButton
            secondary
            label="Discard Pile"
            onTouchTap={() => this.setState({ discardOpen: true })}
            style={this.styles.discard}
            disabled={gameProps[`${color}DiscardPile`].length === 0}/>
          <Deck deck={gameProps[`${color}Deck`]} />
        </div>

        <Dialog
          title="Discard Pile"
          modal={false}
          open={this.state.discardOpen}
          contentStyle={{ width: 700 }}
          bodyStyle={{ overflow: 'auto' }}
          onRequestClose={() => this.setState({ discardOpen: false })}>
          <DiscardPile
            cards={gameProps[`${color}DiscardPile`]} />
        </Dialog>
      </div>
    );
  }
}

PlayerArea.propTypes = {
  color: string,
  gameProps: object,
  opponent: bool
};

export default PlayerArea;
