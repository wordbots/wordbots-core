import React from 'react';
import Helmet from 'react-helmet';
import Paper from 'material-ui/lib/paper';
import Divider from 'material-ui/lib/divider';
import RaisedButton from 'material-ui/lib/raised-button';

import { renderElement, getComponent, createGame } from '../reactHelpers';
import * as actions from '../../src/common/actions/game';
import gameReducer from '../../src/common/reducers/game';
import defaultState from '../../src/common/store/defaultGameState';
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
    const dispatchedActions = [];
    let state = {game: defaultState};

    function dispatch(action) {
      // console.log(action);
      dispatchedActions.push(action);
      state = {game: gameReducer(state.game, action)};
    }

    function clickCard(predicate) {
      getComponent(Card, state, dispatch, predicate).props
        .onCardClick();
      return dispatchedActions.pop();
    }
    function clickHex(id) {
      getComponent(HexGrid, state, dispatch).props
        .actions.onClick(HexUtils.IDToHex(id));
      return dispatchedActions.pop();
    }
    function hoverHex(id, type) {
      getComponent(HexGrid, state, dispatch).props
        .actions.onHexHover(HexUtils.IDToHex(id), {type: type});
      return dispatchedActions.pop();
    }
    function clickEndTurn() {
      getComponent(RaisedButton, state, dispatch).props
        .onTouchTap();
      return dispatchedActions.pop();
    }

    // Hover.
    expect(
      hoverHex('4,0,-4', 'mouseenter')
    ).toEqual(
      actions.setHoveredCard({
        card: createGame(state).props.orangePieces['4,0,-4'].card,
        stats: {health: 20}
      })
    );
    expect(
      hoverHex('4,0,-4', 'mouseleave')
    ).toEqual(
      actions.setHoveredCard(null)
    );

    // Set selected card.
    const attackBotCard = createGame(state).props.orangeHand.find(c => c.name === 'Attack Bot');
    expect(
      clickCard(c => c.props.visible && c.props.name === 'Attack Bot')
    ).toEqual(
      actions.setSelectedCard(0)
    );

    // Place object.
    expect(
      clickHex('3,0,-3')
    ).toEqual(
      actions.placeCard('3,0,-3', attackBotCard)
    );

    // End turn.
    expect(
      clickEndTurn() && clickEndTurn()
    ).toEqual(
      actions.passTurn()
    );

    // Set selected tile.
    expect(
      clickHex('3,0,-3')
    ).toEqual(
      actions.setSelectedTile('3,0,-3')
    );

    // Move.
    expect(
      clickHex('2,0,-2')
    ).toEqual(
      actions.moveRobot('3,0,-3', '2,0,-2')
    );

    // TODO attack.
  });
});
