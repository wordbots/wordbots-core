import { DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import * as React from 'react';

import { MAX_Z_INDEX, SIDEBAR_COLLAPSED_WIDTH, STATUS_Z_INDEX } from '../../constants';
import * as w from '../../types';

import Deck from './Deck';
import DiscardPile from './DiscardPile';
import EnergyCount from './EnergyCount';
import { GameProps } from './GameArea';
import Hand from './Hand';
import PlayerName from './PlayerName';

interface PlayerAreaProps {
  gameProps: GameProps & {
    chatOpen: boolean
    onSelectCard: (index: number, player: w.PlayerColor) => void
    onSelectCardInDiscardPile: (cardId: w.CardId, player: w.PlayerColor) => void
    onTutorialStep: (back?: boolean) => void
  }
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
        style={{
          ...this.styles.container,
          paddingLeft: gameProps.isSandbox ? (SIDEBAR_COLLAPSED_WIDTH + 5) : 0
        }}
      >
        <PlayerName
          opponent={opponent}
          color={color}
          playerName={gameProps.usernames[color]}
          isSandbox={gameProps.isSandbox}
        />
        <EnergyCount
          color={color}
          energy={this.energy}
        />
        <Hand
          // curved
          key={`hand-${gameProps.chatOpen}` /** toggling chat should redraw Hand, recalculating dimensions */}
          opponent={opponent}
          selectedCard={gameProps.selectedCard!}
          targetableCards={gameProps.target.possibleCardsInHand}
          isCurrentPlayer={gameProps.currentTurn === color}
          isActivePlayer={gameProps.player === color}
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
          <Button
            variant="contained"
            color="primary"
            style={{
              ...this.styles.discard,
              lineHeight: 0
            }}
            onClick={this.handleOpenDiscardPile}
          >
            <span
              style={{
                height: '100%',
                writingMode: 'vertical-rl'
              }}
            >
              Open Discard Pile&nbsp;&nbsp;(<b>{this.discardPile.length}</b>)
            </span>
          </Button>
          <Deck deck={this.deck} />
        </div>

        <Dialog
          open={this.state.discardOpen}
          PaperProps={{
            style: {
              width: 700,
              overflow: 'auto',
            }
          }}
          style={{ zIndex: MAX_Z_INDEX }}
          onClose={this.handleCloseDiscardPile}
        >
          <DialogTitle>
            Discard Pile
          </DialogTitle>
          <DialogContent>
            <DiscardPile
              cards={this.discardPile}
              targetableCards={gameProps.target.possibleCardsInDiscardPile}
              onSelectCard={this.handleSelectCardInDiscardPile}
            />
          </DialogContent>
          <DialogActions>
            <Button
              key="Close"
              color="primary"
              onClick={this.handleCloseDiscardPile}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }

  private handleSelectCard = (idx: number) => {
    if (this.props.gameProps.isWaitingForParse) { return; }
    this.props.gameProps.onSelectCard(idx, this.color);
  }

  private handleSelectCardInDiscardPile = (id: w.CardId) => {
    if (this.props.gameProps.isWaitingForParse) { return; }
    this.props.gameProps.onSelectCardInDiscardPile(id, this.color);
    this.handleCloseDiscardPile();
  }

  private handleOpenDiscardPile = () => this.setState({ discardOpen: true });
  private handleCloseDiscardPile = () => this.setState({ discardOpen: false });
}
