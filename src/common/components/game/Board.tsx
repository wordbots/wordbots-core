import { forOwn, isString, mapValues } from 'lodash';
import * as React from 'react';

import { BLUE_PLACEMENT_HEXES, GRID_CONFIG, ORANGE_PLACEMENT_HEXES, TYPE_ROBOT, TYPE_STRUCTURE } from '../../constants';
import defaultGameState, { arbitraryPlayerState } from '../../store/defaultGameState';
import * as w from '../../types';
import {
  getAttribute, intermediateMoveHexId, movesLeft, ownerOf,
  validActionHexes, validAttackHexes, validMovementHexes, validPlacementHexes
} from '../../util/game';
import Hex from '../hexgrid/Hex';
import HexGrid from '../hexgrid/HexGrid';
import HexUtils from '../hexgrid/HexUtils';
import Layout from '../hexgrid/Layout';
import { PieceOnBoard } from '../hexgrid/types';

interface BoardProps {
  bluePieces: Record<string, w.Object>
  orangePieces: Record<string, w.Object>

  player: w.PlayerColor | null
  currentTurn: w.PlayerColor
  selectedTile: string | null
  playingCardType: w.CardType | null
  target: w.CurrentTarget
  size: number
  tutorialStep?: w.TutorialStep
  attack: w.Attack | null
  isGameOver: boolean

  onSelectTile: (hexId: w.HexId, action?: 'move' | 'attack' | 'place' | null, intermediateMoveHexId?: w.HexId | null) => void
  onActivateAbility: (abilityIdx: number) => void
  onTutorialStep: (back?: boolean) => void
  onEndGame: () => void
}

interface BoardState {
  grid: { hexagons: Hex[], layout: Layout },
  hoveredHexId: w.HexId | undefined
}

export default class Board extends React.Component<BoardProps, BoardState> {
  public state: BoardState = {
    grid: HexGrid.generate(GRID_CONFIG),
    hoveredHexId: undefined
  };

  // Many util functions require a game state object, so we create a dummy one with minimal data.
  // TODO find a less gross approach?
  get dummyGameState(): w.GameState {
    return {
      ...defaultGameState,
      players: {
        blue: {...arbitraryPlayerState(), name: 'blue', robotsOnBoard: this.props.bluePieces},
        orange: {...arbitraryPlayerState(), name: 'orange', robotsOnBoard: this.props.orangePieces}
      }
    };
  }

  get isMyTurn(): boolean {
    return this.props.currentTurn === this.props.player;
  }

  get playingAnObject(): boolean {
    return this.props.playingCardType === TYPE_ROBOT || this.props.playingCardType === TYPE_STRUCTURE;
  }

  get currentPlayerPieces(): Record<string, w.Object> {
    return (this.props.currentTurn === 'blue' ? this.props.bluePieces : this.props.orangePieces);
  }

  get allPieces(): Record<string, w.Object>  {
    return {...this.props.bluePieces, ...this.props.orangePieces};
  }

  get piecesOnGrid(): Record<w.HexId, PieceOnBoard> {
    const attack = this.props.attack;

    return mapValues(this.allPieces, (piece, hex) => ({
      id: piece.id,
      type: piece.card.type,
      image: piece.card.img ? {img: piece.card.img} : {sprite: piece.card.spriteID || piece.card.name},
      card: piece.card,
      stats: {
        health: getAttribute(piece, 'health')!,
        attack: getAttribute(piece, 'attack'),
        movesUsed: (piece && getAttribute(piece, 'speed') !== undefined) ? (getAttribute(piece, 'speed')! - movesLeft(piece as w.Robot)) : undefined,
        movesAvailable: (piece && getAttribute(piece, 'speed') !== undefined) ? movesLeft(piece as w.Robot) : undefined
      },
      attacking: (attack && attack.from === hex && !attack.retract) ? attack.to : null
    }));
  }

  get selectedHex(): Hex | null {
    const { selectedTile } = this.props;
    return selectedTile !== null ? HexUtils.IDToHex(selectedTile) : null;
  }

  get selectedPiece(): w.Object | null {
    const { selectedTile } = this.props;
    return selectedTile !== null ? this.currentPlayerPieces[selectedTile] : null;
  }

  get selectedActivatedAbilities(): w.ActivatedAbility[] {
    if (this.isMyTurn && this.selectedPiece
          && this.selectedPiece.activatedAbilities && !this.selectedPiece.cantActivate
          && !this.props.target.choosing) {  // Don't display activated abilities popup while choosing a target.
      return this.selectedPiece.activatedAbilities;
    } else {
      return [];
    }
  }

  get placementHexes(): Hex[] {
    return this.props.playingCardType !== null ? validPlacementHexes(this.dummyGameState, this.props.currentTurn, this.props.playingCardType) : [];
  }

  get hexColors(): Record<w.HexId, 'blue' | 'bright_blue' | 'orange' | 'bright_orange' | 'green' | 'red'> {
    const hexColors: Record<w.HexId, 'blue' | 'bright_blue' | 'orange' | 'bright_orange' | 'green' | 'red'> = {};

    // tslint:disable-next-line no-inner-declarations
    function color(hexes: Array<Hex | w.HexId>, colorName: 'blue' | 'bright_blue' | 'orange' | 'bright_orange' | 'green' | 'red'): void {
      hexes.forEach((hex) => {
        hexColors[isString(hex) ? hex : HexUtils.getID(hex)] = colorName;
      });
    }

    color(BLUE_PLACEMENT_HEXES, 'blue');
    color(ORANGE_PLACEMENT_HEXES, 'orange');

    forOwn(this.allPieces, (piece, hex) => {
      const owner = ownerOf(this.dummyGameState, piece)!.name;
      const canMove = (owner === this.props.currentTurn) && this.hasValidActions(HexUtils.IDToHex(hex));

      color([hex], `${canMove ? 'bright_' : ''}${owner}` as 'blue' | 'bright_blue' | 'orange' | 'bright_orange');
    });

    if (this.isMyTurn) {
      if (this.props.target.choosing) {
        color(this.props.target.possibleHexes, 'green');
      } else if (this.playingAnObject) {
        color(this.placementHexes, 'green');
      } else if (this.selectedHex) {
        color(this.getValidMovementHexes(this.selectedHex), 'green');
        color(this.getValidAttackHexes(this.selectedHex), 'red');
      }
    }

    return hexColors;
  }

  public render(): JSX.Element {
    const { size, tutorialStep, isGameOver, onActivateAbility, onEndGame, onTutorialStep, selectedTile } = this.props;
    const { grid: { hexagons, layout }, hoveredHexId } = this.state;

    return (
      <div id="hexgrid">
        <HexGrid
          hexColors={this.hexColors}
          pieces={this.piecesOnGrid}
          width={size}
          height={size}
          hexagons={hexagons}
          layout={layout}
          selectedHexId={selectedTile || undefined}
          hoveredHexId={hoveredHexId}
          tutorialStep={tutorialStep}
          activatedAbilities={this.selectedActivatedAbilities}
          isGameOver={isGameOver}
          actions={{
            onClick: this.onHexClick,
            onHexHover: this.onHexHover,
            onActivateAbility,
            onTutorialStep,
            onEndGame
          }}
        />
      </div>
    );
  }

  private getValidMovementHexes(startHex: Hex | null): Hex[] {
    return startHex ? validMovementHexes(this.dummyGameState, startHex) : [];
  }
  private getValidAttackHexes(startHex: Hex | null): Hex[] {
    return startHex ? validAttackHexes(this.dummyGameState, startHex) : [];
  }
  private hasValidActions(startHex: Hex | null): boolean {
    return !!startHex && validActionHexes(this.dummyGameState, startHex).length > 0;
  }

  private onHexHover = (hex: Hex, evt: React.MouseEvent<any>) => {
    this.setState({
      hoveredHexId: evt.type === 'mouseleave' ? undefined : HexUtils.getID(hex)
    });
  }

  private onHexClick = (hex: Hex) => {
    const hexId = HexUtils.getID(hex);

    if (this.isMyTurn) {
      if (this.playingAnObject && this.placementHexes.map(HexUtils.getID).includes(hexId)) {
        this.props.onSelectTile(hexId, 'place');
      } else if (this.selectedPiece) {
        this.onMoveOrAttack(hex);
      } else {
        this.props.onSelectTile(hexId);
      }
    } else {
      this.props.onSelectTile(hexId);
    }
  }

  private onMoveOrAttack = (hex: Hex) => {
    const hexId = HexUtils.getID(hex);
    const movementHexIds = this.getValidMovementHexes(this.selectedHex).map(HexUtils.getID);
    const attackHexIds = this.getValidAttackHexes(this.selectedHex).map(HexUtils.getID);

    if (movementHexIds.includes(hexId)) {
      this.props.onSelectTile(hexId, 'move');
    } else if (attackHexIds.includes(hexId)) {
      this.props.onSelectTile(hexId, 'attack', intermediateMoveHexId(this.dummyGameState, this.selectedHex!, hex));
    } else {
      this.props.onSelectTile(hexId);
    }
  }
}
