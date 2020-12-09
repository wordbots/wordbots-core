import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import * as React from 'react';

import { STATUS_Z_INDEX } from '../../constants';
import { GameAreaContainerProps } from '../../containers/GameAreaContainer';
import * as w from '../../types';

import Deck from './Deck';
import DiscardPile from './DiscardPile';
import EnergyCount from './EnergyCount';
import Hand from './Hand';
import PlayerName from './PlayerName';

interface PlayerAreaProps {
  gameProps: GameAreaContainerProps
  opponent?: boolean
}

interface PlayerAreaState {
  discardOpen: boolean
}

export default class PlayerArea extends React.Component<PlayerAreaProps, PlayerAreaState> {
  public state = {
    discardOpen: false
  };

  get color(): 'blue' | 'orange' {
    const { opponent, gameProps: { player } } = this.props;

    if (opponent) {
      return (player === 'blue') ? 'orange' : 'blue';
    } else {
      return (player === 'neither') ? 'orange' : player;
    }
  }

  get deck(): w.PossiblyObfuscatedCard[] {
    const { gameProps } = this.props;
    return this.color === 'blue' ? gameProps.blueDeck : gameProps.orangeDeck;
  }

  get discardPile(): w.PossiblyObfuscatedCard[] {
    const { gameProps } = this.props;
    return this.color === 'blue' ? gameProps.blueDiscardPile : gameProps.orangeDiscardPile;
  }

  get energy(): w.PlayerEnergy {
    const { gameProps } = this.props;
    return this.color === 'blue' ? gameProps.blueEnergy : gameProps.orangeEnergy;
  }

  get hand(): w.PossiblyObfuscatedCard[] {
    const { gameProps } = this.props;
    return this.color === 'blue' ? gameProps.blueHand : gameProps.orangeHand;
  }

  get styles(): Record<string, React.CSSProperties> {
    const { opponent } = this.props;

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
        display: 'flex',
        zIndex: STATUS_Z_INDEX
      },
      discard: {
        width: 36,
        minWidth: 0,
        height: 210,
        marginRight: 8
      }
    };
  }

  public componentWillReceiveProps(newProps: PlayerAreaProps): void {
    const { gameProps } = this.props;
    const { gameProps: newGameProps } = newProps;
    const { discardOpen } = this.state;

    // Automatically open the discard pile dialog if the player needs to select cards from it.
    if (newGameProps.target.possibleCardsInDiscardPile.length > 0 && gameProps.target.possibleCardsInDiscardPile.length === 0) {
      // Is the discard pile currently closed and are there selectable cards in it?
      if (!discardOpen && newGameProps.target.possibleCardsInDiscardPile.find((id) => this.discardPile.map((c) => c.id).includes(id))) {
        this.handleOpenDiscardPile();
      }
    }
  }

  public render(): JSX.Element {
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
          playerName={gameProps.usernames[color]}
        />
        <EnergyCount
          color={color}
          energy={this.energy}
        />
        <Hand
          // curved
          opponent={opponent}
          selectedCard={gameProps.selectedCard!}
          targetableCards={gameProps.target.possibleCardsInHand}
          isActivePlayer={gameProps.player === color || gameProps.isSandbox}
          cards={this.hand}
          sandbox={gameProps.isSandbox}
          status={gameProps.status}
          tutorialStep={gameProps.tutorialStep}
          onSelectCard={this.handleSelectCard}
          onTutorialStep={gameProps.onTutorialStep}
        />

        <div
          className="background"
          style={this.styles.discardContainer}
        >
          <RaisedButton
            secondary
            buttonStyle={{
              lineHeight: 0
            }}
            label={<span>Open Discard Pile&nbsp;&nbsp;(<b>{this.discardPile.length}</b>)</span>}
            labelStyle={{
              height: '100%',
              writingMode: 'vertical-rl'
            }}
            onClick={this.handleOpenDiscardPile}
            style={this.styles.discard}
          />
          <Deck deck={this.deck} />
        </div>

        <Dialog
          title="Discard Pile"
          modal={false}
          open={this.state.discardOpen}
          contentStyle={{ width: 700 }}
          bodyStyle={{ overflow: 'auto' }}
          onRequestClose={this.handleCloseDiscardPile}
          actions={[
            <FlatButton
              key="Close"
              label="Close"
              primary
              onClick={this.handleCloseDiscardPile}
            />
          ]}
        >
          <DiscardPile
            cards={this.discardPile}
            targetableCards={gameProps.target.possibleCardsInDiscardPile}
            onSelectCard={this.handleSelectCardInDiscardPile}
          />
        </Dialog>
      </div>
    );
  }

  private handleSelectCard = (idx: number) => this.props.gameProps.onSelectCard(idx, this.color);

  private handleSelectCardInDiscardPile = (id: w.CardId) => {
    this.props.gameProps.onSelectCardInDiscardPile(id, this.color);
    this.handleCloseDiscardPile();
  }

  private handleOpenDiscardPile = () => {
    this.setState({ discardOpen: true });
  }

  private handleCloseDiscardPile = () => this.setState({ discardOpen: false });
}
