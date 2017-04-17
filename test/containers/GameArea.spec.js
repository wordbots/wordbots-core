import React from 'react';
import Helmet from 'react-helmet';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';

import { getDefaultState, combineState } from '../testHelpers';
import { renderElement, getComponent, createGameArea } from '../reactHelpers';
import Card from '../../src/common/components/card/Card';
import CardViewer from '../../src/common/components/card/CardViewer';
import Board from '../../src/common/components/game/Board';
import EndTurnButton from '../../src/common/components/game/EndTurnButton';
import PlayerArea from '../../src/common/components/game/PlayerArea';
import Status from '../../src/common/components/game/Status';
import VictoryScreen from '../../src/common/components/game/VictoryScreen';
import Chat from '../../src/common/components/multiplayer/Chat';
import HexGrid from '../../src/common/components/react-hexgrid/HexGrid';
import HexUtils from '../../src/common/components/react-hexgrid/HexUtils';
import * as actions from '../../src/common/actions/game';
import gameReducer from '../../src/common/reducers/game';

describe('GameArea container', () => {
  it('renders the default game state', () => {
    const state = combineState(getDefaultState());

    const game = createGameArea(state);
    const dom = renderElement(game);

    // Gross but necessary for comparing bound methods.
    const mainDiv = dom.props.children[1].props.children[1];
    const [ , , board, endTurnBtn] = mainDiv.props.children;

    expect(dom.props.children).toEqual([
      <Helmet title="Game"/>,
      <Paper style={{height: 1100, position: 'relative'}}>
        <PlayerArea opponent gameProps={game.props} />
        <div
          ref={mainDiv.ref}
          style={{position: 'absolute', left: 0, top: 125, bottom: 125, right: 0}}
        >
          <CardViewer hoveredCard={undefined} />
          <Status
            player={'orange'}
            status={state.game.players.orange.status} />
          <Board
            selectedTile={null}
            target={state.game.players.orange.target}
            bluePieces={state.game.players.blue.robotsOnBoard}
            orangePieces={state.game.players.orange.robotsOnBoard}
            player={'orange'}
            currentTurn={'orange'}
            playingCardType={null}
            height={600}
            onSelectTile={board.props.onSelectTile}
            onHoverTile={board.props.onHoverTile}
            />
          <EndTurnButton
            enabled
            onClick={endTurnBtn.props.onClick} />
        </div>
        <PlayerArea gameProps={game.props} />
        <VictoryScreen
          winnerColor={null}
          winnerName={null}
          onClick={game.props.onVictoryScreenClick} />
      </Paper>
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
      getComponent('GameArea', Card, state, dispatch, predicate).props
        .onCardClick();
      return dispatchedActions.pop();
    }
    function clickHex(id) {
      getComponent('GameArea', HexGrid, state, dispatch).props
        .actions.onClick(HexUtils.IDToHex(id));
      return dispatchedActions.pop();
    }
    function hoverHex(id, type) {
      getComponent('GameArea', HexGrid, state, dispatch).props
        .actions.onHexHover(HexUtils.IDToHex(id), {type: type});
      return dispatchedActions.pop();
    }
    function clickEndTurn() {
      getComponent('GameArea', RaisedButton, state, dispatch).props
        .onTouchTap();
      return dispatchedActions.pop();
    }

    // Hover.
    expect(
      hoverHex('3,0,-3', 'mouseenter')
    ).toEqual(
      actions.setHoveredTile({
        card: createGameArea(state).props.orangePieces['3,0,-3'].card,
        stats: {health: 20}
      })
    );
    expect(
      hoverHex('3,0,-3', 'mouseleave')
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
      clickHex('2,0,-2')
    ).toEqual(
      actions.placeCard('2,0,-2', 0)
    );

    // End turn.
    expect(
      clickEndTurn()
    ).toEqual(
      actions.passTurn('orange')
    );

    dispatch(actions.passTurn('blue'));  // Simulate opponent ending their turn.

    // Set selected tile.
    expect(
      clickHex('2,0,-2')
    ).toEqual(
      actions.setSelectedTile('2,0,-2', 'orange')
    );

    // Move.
    expect(
      clickHex('1,0,-1')
    ).toEqual(
      actions.moveRobot('2,0,-2', '1,0,-1')
    );

    // TODO attack.
  });
});
