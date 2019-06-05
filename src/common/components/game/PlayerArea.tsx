import Dialog from 'material-ui/Dialog';
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
    discardOpen: this.props.gameProps.target.possibleCardsInDiscardPile.length > 0 ? true : false
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
    const { opponent, gameProps: { isSandbox } } = this.props;

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
        marginRight: 8,
        marginTop: isSandbox ? (opponent ? -23 : -9) : -36,
        transform: 'rotate(-90deg)',
        transformOrigin: '100% 100%',
        height: 36,
        width: 210
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
          selectedCard={gameProps.selectedCard}
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
            label={`Discard Pile (${this.discardPile.length})`}
            onClick={this.handleOpenDiscardPile}
            style={this.styles.discard}
            disabled={this.discardPile.length === 0}
          />
          <Deck deck={this.deck} reveal={gameProps.isSandbox} opponent={opponent} />
        </div>

        <Dialog
          title="Discard Pile"
          modal={false}
          open={this.state.discardOpen}
          contentStyle={{ width: 700 }}
          bodyStyle={{ overflow: 'auto' }}
          onRequestClose={this.handleCloseDiscardPile}
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
    if (this.discardPile.length > 0) {
      this.setState({ discardOpen: true });
    }
  }

  private handleCloseDiscardPile = () => this.setState({ discardOpen: false });
}
