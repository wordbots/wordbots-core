import React from 'react';
import Utils from 'react-addons-test-utils';
import Helmet from 'react-helmet';
import Paper from 'material-ui/lib/paper';
import Divider from 'material-ui/lib/divider';
import RaisedButton from 'material-ui/lib/raised-button';

import { renderElement, createGame, refreshGameInstance, lastDispatch } from '../react_helpers';
import * as actions from '../../src/common/actions/game';
import defaultState from '../../src/common/store/defaultState';
import Board from '../../src/common/components/game/Board';
import Card from '../../src/common/components/game/Card';
import CardViewer from '../../src/common/components/game/CardViewer';
import PlayerArea from '../../src/common/components/game/PlayerArea';
import Status from '../../src/common/components/game/Status';
import VictoryScreen from '../../src/common/components/game/VictoryScreen';
import HexGrid from '../../src/common/components/react-hexgrid/HexGrid';
import HexUtils from '../../src/common/components/react-hexgrid/HexUtils';

describe('Game container', () => {
  it('renders the default game state', () => {
    const state = {game: defaultState};

    const game = createGame(state);
    const dom = renderElement(game);
    const board = dom.props.children[1].props.children[2].props.children[2];  // Gross but necessary for comparing bound methods.

    const defaultStatus = {message: '', type: ''};

    expect(dom.props.children).toEqual([
      <Helmet title="Game"/>,
      <Paper style={{padding: 20, position: 'relative'}}>
        <PlayerArea
          name={'orange'}
          isCurrentPlayer
          status={defaultStatus}
          energy={state.game.players.orange.energy}
          cards={state.game.players.orange.hand}
          deck={state.game.players.orange.deck}
          selectedCard={null}
          targetableCards={[]}
          onSelectCard={game.props.onSelectCard}
          />
        <Divider style={{marginTop: 10}}/>
        <div style={{position: 'relative'}}>
          <CardViewer hoveredCard={null} />
          <Status
            currentTurn={'orange'}
            status={defaultStatus} />
          <Board
            selectedTile={null}
            target={state.game.target}
            bluePieces={state.game.players.blue.robotsOnBoard}
            orangePieces={state.game.players.orange.robotsOnBoard}
            currentTurn={'orange'}
            playingCardType={null}
            onSelectTile={board.props.onSelectTile}
            onHoverTile={board.props.onHoverTile}
            />
          <RaisedButton
            secondary
            label="End Turn"
            style={{position: 'absolute', top: 0, bottom: 0, right: 0, margin: 'auto', color: 'white'}}
            onTouchTap={game.props.onPassTurn} />
        </div>
        <Divider style={{marginBottom: 10}}/>
        <PlayerArea
          name={'blue'}
          isCurrentPlayer={false}
          status={defaultStatus}
          energy={state.game.players.blue.energy}
          cards={state.game.players.blue.hand}
          deck={state.game.players.blue.deck}
          selectedCard={null}
          targetableCards={[]}
          onSelectCard={game.props.onSelectCard}
          />
        <VictoryScreen winner={null} />
      </Paper>
    ]);
  });

  it('should propagate events', () => {
    function renderGame() { return Utils.renderIntoDocument(refreshGameInstance()); }

    function gameProps() { return refreshGameInstance().props; }

    function renderCards() { return Utils.scryRenderedComponentsWithType(renderGame(), Card); }
    function renderHexGrid() { return Utils.findRenderedComponentWithType(renderGame(), HexGrid); }

    function clickCard(pred) { renderCards().find(pred).props.onCardClick(); }
    function clickHex(id) { renderHexGrid().props.actions.onClick(HexUtils.IDToHex(id)); }
    function hoverHex(id, type) { renderHexGrid().props.actions.onHexHover(HexUtils.IDToHex(id), {type: type}); }
    function clickEndTurn() { Utils.findRenderedComponentWithType(renderGame(), RaisedButton).props.onTouchTap(); }

    // Hover
    hoverHex('4,0,-4', 'mouseenter');
    expect(lastDispatch()).toEqual(
      actions.setHoveredCard({
        card: gameProps().orangePieces['4,0,-4'].card,
        stats: {health: 20}
      })
    );
    hoverHex('4,0,-4', 'mouseleave');
    expect(lastDispatch()).toEqual(
      actions.setHoveredCard(null)
    );

    // Set selected card
    const attackBotCard = gameProps().orangeHand.find(c => c.name == 'Attack Bot');
    clickCard(c => c.props.visible && c.props.name == 'Attack Bot');
    expect(lastDispatch()).toEqual(
      actions.setSelectedCard(0)
    );

    // Place object
    clickHex('3,0,-3');
    expect(lastDispatch()).toEqual(
      actions.placeCard('3,0,-3', attackBotCard)
    );

    // End turn
    clickEndTurn();
    clickEndTurn();
    expect(lastDispatch()).toEqual(
      actions.passTurn()
    );

    // Set selected tile
    clickHex('3,0,-3');
    expect(lastDispatch()).toEqual(
      actions.setSelectedTile('3,0,-3')
    );

    // Move
    clickHex('2,0,-2');
    expect(lastDispatch()).toEqual(
      actions.moveRobot('3,0,-3', '2,0,-2')
    );
  });
});
