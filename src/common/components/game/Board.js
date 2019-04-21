import * as React from 'react';
import { bool, func, number, object, string } from 'prop-types';
import { forOwn, isString, mapValues, isUndefined } from 'lodash';

import HexGrid from '../hexgrid/HexGrid';
import HexUtils from '../hexgrid/HexUtils';
import { TYPE_ROBOT, TYPE_STRUCTURE, GRID_CONFIG } from '../../constants.ts';
import {
  getAttribute, ownerOf, movesLeft,
  validPlacementHexes, validMovementHexes, validAttackHexes, validActionHexes, intermediateMoveHexId
} from '../../util/game.ts';

export default class Board extends React.Component {
  static propTypes = {
    bluePieces: object,
    orangePieces: object,

    player: string,
    currentTurn: string,
    selectedTile: string,
    playingCardType: number,
    target: object,
    size: number,
    tutorialStep: object,
    attack: object,
    isGameOver: bool,

    onSelectTile: func,
    onActivateAbility: func,
    onTutorialStep: func,
    onEndGame: func
  };

  state = {
    grid: HexGrid.generate(GRID_CONFIG),
    hoveredHexId: null
  };

  // Many util functions require a game state object, so we create a dummy one with minimal data.
  // TODO find a less gross approach?
  get dummyGameState() {
    return {
      players: {
        blue: {name: 'blue', robotsOnBoard: this.props.bluePieces},
        orange: {name: 'orange', robotsOnBoard: this.props.orangePieces}
      }
    };
  }

  get isMyTurn() {
    return this.props.currentTurn === this.props.player;
  }

  get playingAnObject() {
    return this.props.playingCardType === TYPE_ROBOT || this.props.playingCardType === TYPE_STRUCTURE;
  }

  get currentPlayerPieces() {
    return (this.props.currentTurn === 'blue' ? this.props.bluePieces : this.props.orangePieces);
  }

  get allPieces() {
    return Object.assign({}, this.props.bluePieces, this.props.orangePieces);
  }

  get piecesOnGrid() {
    const attack = this.props.attack;

    return mapValues(this.allPieces, (piece, hex) => ({
      id: piece.id,
      type: piece.card.type,
      image: piece.card.img ? {img: piece.card.img} : {sprite: piece.card.spriteID || piece.card.name},
      card: piece.card,
      stats: {
        health: getAttribute(piece, 'health'),
        attack: getAttribute(piece, 'attack'),
        movesUsed: !isUndefined(getAttribute(piece, 'speed')) ? (getAttribute(piece, 'speed') - movesLeft(piece)) : undefined,
        movesAvailable: !isUndefined(getAttribute(piece, 'speed')) ? movesLeft(piece) : undefined
      },
      attacking: (attack && attack.from === hex && !attack.retract) ? attack.to : null
    }));
  }

  get selectedHexId() { return this.props.selectedTile; }
  get selectedHex() { return HexUtils.IDToHex(this.selectedHexId); }
  get selectedPiece() { return this.currentPlayerPieces[this.selectedHexId]; }

  get selectedActivatedAbilities() {
    if (this.isMyTurn && this.selectedPiece
          && this.selectedPiece.activatedAbilities && !this.selectedPiece.cantActivate
          && !this.props.target.choosing) {  // Don't display activated abilities popup while choosing a target.
      return this.selectedPiece.activatedAbilities;
    } else {
      return [];
    }
  }

  get placementHexes() {
    return validPlacementHexes(this.dummyGameState, this.props.currentTurn, this.props.playingCardType);
  }

  get hexColors() {
    const hexColors = {};

    function color(hexes, colorName) {
      hexes.forEach(hex => {
        hexColors[isString(hex) ? hex : HexUtils.getID(hex)] = colorName;
      });
    }

    forOwn(this.allPieces, (piece, hex) => {
      const owner = ownerOf(this.dummyGameState, piece).name;
      const canMove = (owner === this.props.currentTurn) && this.hasValidActions(HexUtils.IDToHex(hex));

      color([hex], `${canMove ? 'bright_' : ''}${owner}`);
    });

    if (this.isMyTurn) {
      if (this.props.target.choosing) {
        color(this.props.target.possibleHexes, 'green');
      } else if (this.playingAnObject) {
        color(this.placementHexes, 'green');
      } else if (this.selectedPiece) {
        color(this.getValidMovementHexes(this.selectedHex), 'green');
        color(this.getValidAttackHexes(this.selectedHex), 'red');
      }
    }

    return hexColors;
  }

  getValidMovementHexes(startHex) {
    return validMovementHexes(this.dummyGameState, startHex);
  }
  getValidAttackHexes(startHex) {
    return validAttackHexes(this.dummyGameState, startHex);
  }
  hasValidActions(startHex) {
    return validActionHexes(this.dummyGameState, startHex).length > 0;
  }

  onHexClick = (hex) => {
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
  };

  onMoveOrAttack = (hex) => {
    const hexId = HexUtils.getID(hex);
    const movementHexIds = this.getValidMovementHexes(this.selectedHex).map(HexUtils.getID);
    const attackHexIds = this.getValidAttackHexes(this.selectedHex).map(HexUtils.getID);

    if (movementHexIds.includes(hexId)) {
      this.props.onSelectTile(hexId, 'move');
    } else if (attackHexIds.includes(hexId)) {
      this.props.onSelectTile(hexId, 'attack', intermediateMoveHexId(this.dummyGameState, this.selectedHex, hex));
    } else {
      this.props.onSelectTile(hexId);
    }
  };

  onHexHover = (hex, event) => {
    this.setState({
      hoveredHexId: event.type === 'mouseleave' ? null : HexUtils.getID(hex)
    });
  };

  render() {
    const { size, tutorialStep, isGameOver, onActivateAbility, onEndGame, onTutorialStep } = this.props;
    const { hexagons, layout } = this.state.grid;

    return (
      <div id="hexgrid">
        <HexGrid
          hexColors={this.hexColors}
          pieces={this.piecesOnGrid}
          width={size}
          height={size}
          hexagons={hexagons}
          layout={layout}
          selectedHexId={this.selectedHexId}
          hoveredHexId={this.state.hoveredHexId}
          tutorialStep={tutorialStep}
          activatedAbilities={this.selectedActivatedAbilities}
          isGameOver={isGameOver}
          actions={{
            onClick: this.onHexClick,
            onHexHover: this.onHexHover,
            onActivateAbility: onActivateAbility,
            onTutorialStep: onTutorialStep,
            onEndGame: onEndGame
          }} />
      </div>
    );
  }
}
