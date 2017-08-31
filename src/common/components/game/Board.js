import React, { Component } from 'react';
import { func, number, object, string } from 'prop-types';
import { forOwn, isString, mapValues } from 'lodash';

import HexGrid from '../hexgrid/HexGrid';
import HexUtils from '../hexgrid/HexUtils';
import { TYPE_ROBOT, TYPE_STRUCTURE, GRID_CONFIG } from '../../constants';
import {
  getAttribute, ownerOf,
  validPlacementHexes, validMovementHexes, validAttackHexes, validActionHexes, intermediateMoveHexId
} from '../../util/game';

export default class Board extends Component {
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

    onSelectTile: func,
    onHoverTile: func,
    onTutorialStep: func,
    onEndGame: func
  };

  constructor(props) {
    super(props);

    const boardConfig = GRID_CONFIG;
    const grid = HexGrid.generate(boardConfig);

    this.state = {
      grid,
      config: boardConfig
    };
  }

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
      stats: {
        health: getAttribute(piece, 'health'),
        attack: getAttribute(piece, 'attack')
      },
      attacking: (attack && attack.from === hex && !attack.retract) ? attack.to : null
    }));
  }

  get selectedHexId() { return this.props.selectedTile; }
  get selectedHex() { return HexUtils.IDToHex(this.selectedHexId); }
  get selectedPiece() { return this.currentPlayerPieces[this.selectedHexId]; }
  get selectedActivatedAbilities() { return (this.selectedPiece && this.selectedPiece.activatedAbilities) || []; }

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
      const isStructure = piece.card.type === TYPE_STRUCTURE;

      color([hex], `${canMove ? 'bright_' : ''}${owner}${isStructure ? '_grayish' : ''}`);
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

  onHexClick(hex) {
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

  onMoveOrAttack(hex) {
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
  }

  onHexHover(hex, event) {
    this.props.onHoverTile(HexUtils.getID(hex), event.type);
  }

  render() {
    const { grid } = this.state;

    return (
      <div id="hexgrid">
        <HexGrid
          hexColors={this.hexColors}
          pieces={this.piecesOnGrid}
          width={this.props.size}
          height={this.props.size}
          hexagons={grid.hexagons}
          layout={grid.layout}
          selectedHexId={this.selectedHexId}
          tutorialStep={this.props.tutorialStep}
          activatedAbilities={this.selectedActivatedAbilities}
          actions={{
            onClick: this.onHexClick.bind(this),
            onHexHover: this.onHexHover.bind(this),
            onTutorialStep: this.props.onTutorialStep,
            onEndGame: this.props.onEndGame
          }} />
      </div>
    );
  }
}
