import React from 'react';
import Helmet from 'react-helmet';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';

import { getDefaultState, combineState } from '../testHelpers';
import { renderElement, getComponent, createGame } from '../reactHelpers';
import * as actions from '../../src/common/actions/game';
import gameReducer from '../../src/common/reducers/game';
import Board from '../../src/common/components/game/Board';
import Card from '../../src/common/components/game/Card';
import CardViewer from '../../src/common/components/game/CardViewer';
import PlayerArea from '../../src/common/components/game/PlayerArea';
import Status from '../../src/common/components/game/Status';
import VictoryScreen from '../../src/common/components/game/VictoryScreen';
import Chat from '../../src/common/components/multiplayer/Chat';
import HexGrid from '../../src/common/components/react-hexgrid/HexGrid';
import HexUtils from '../../src/common/components/react-hexgrid/HexUtils';

describe('Game container', () => {
  it('renders the default game state', () => {
    const state = combineState(getDefaultState());

    const game = createGame(state);
    const dom = renderElement(game);
    const board = dom.props.children[1].props.children[1].props.children[2];  // Gross but necessary for comparing bound methods.

    const defaultStatus = {message: '', type: ''};

    expect(dom.props.children).toEqual([
      <Helmet title="Game"/>,
      <Paper style={{padding: 20, position: 'relative'}}>
        <PlayerArea
          color={'orange'}
          gameProps={game.props} />
        <div style={{position: 'relative'}}>
          <CardViewer />
          <Status
            player={'orange'}
            status={defaultStatus} />
          <Board
            selectedTile={null}
            target={state.game.players.orange.target}
            bluePieces={state.game.players.blue.robotsOnBoard}
            orangePieces={state.game.players.orange.robotsOnBoard}
            player={'orange'}
            currentTurn={'orange'}
            playingCardType={null}
            onSelectTile={board.props.onSelectTile}
            onHoverTile={board.props.onHoverTile}
            />
          <div style={{position: 'absolute', top: 0, bottom: 0, right: 0, height: 36, margin: 'auto', color: 'white'}}>
            <RaisedButton
              secondary
              label="End Turn"
              onTouchTap={game.props.onPassTurn} />
          </div>
        </div>
        <PlayerArea
          color={'blue'}
          gameProps={game.props} />
        <VictoryScreen
          winner={null}
          onClick={game.props.onVictoryScreenClick} />
      </Paper>,
      <Chat
        roomName={null}
        messages={[]}
        onSendMessage={game.props.onSendChatMessage}
        onHoverCard={game.props.onHoverTile} />
    ]);
  });

  it('should propagate events', () => {
    const dispatchedActions = [];
    const state = combineState(getDefaultState());

    function dispatch(action) {
      // console.log(action);
      dispatchedActions.push(action);
      state.game = gameReducer(state.game, action);
    }

    function clickCard(predicate) {
      getComponent('Game', Card, state, dispatch, predicate).props
        .onCardClick();
      return dispatchedActions.pop();
    }
    function clickHex(id) {
      getComponent('Game', HexGrid, state, dispatch).props
        .actions.onClick(HexUtils.IDToHex(id));
      return dispatchedActions.pop();
    }
    function hoverHex(id, type) {
      getComponent('Game', HexGrid, state, dispatch).props
        .actions.onHexHover(HexUtils.IDToHex(id), {type: type});
      return dispatchedActions.pop();
    }
    function clickEndTurn() {
      getComponent('Game', RaisedButton, state, dispatch).props
        .onTouchTap();
      return dispatchedActions.pop();
    }

    // Hover.
    expect(
      hoverHex('4,0,-4', 'mouseenter')
    ).toEqual(
      actions.setHoveredTile({
        card: createGame(state).props.orangePieces['4,0,-4'].card,
        stats: {health: 20}
      })
    );
    expect(
      hoverHex('4,0,-4', 'mouseleave')
    ).toEqual(
      actions.setHoveredTile(null)
    );

    // Set selected card.
    expect(
      clickCard(c => c.props.visible && c.props.name === 'Attack Bot')
    ).toEqual(
      actions.setSelectedCard(0, 'orange')
    );

    // Place object.
    expect(
      clickHex('3,0,-3')
    ).toEqual(
      actions.placeCard('3,0,-3', 0)
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
      actions.setSelectedTile('3,0,-3', 'orange')
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
