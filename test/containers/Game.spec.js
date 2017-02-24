import React from 'react';
import Helmet from 'react-helmet';
import Paper from 'material-ui/lib/paper';
import Divider from 'material-ui/lib/divider';
import RaisedButton from 'material-ui/lib/raised-button';

import { renderElement } from '../react_helpers';
import { Game, mapStateToProps, mapDispatchToProps } from '../../src/common/containers/Game';
import defaultState from '../../src/common/store/defaultState';
import Board from '../../src/common/components/game/Board';
import PlayerArea from '../../src/common/components/game/PlayerArea';
import Status from '../../src/common/components/game/Status';
import CardViewer from '../../src/common/components/game/CardViewer';
import VictoryScreen from '../../src/common/components/game/VictoryScreen';

describe('Game container', () => {
  it('render the default game state', () => {
    const state = {game: defaultState};

    const game = React.createElement(Game, Object.assign(mapStateToProps(state), mapDispatchToProps()));
    const dom = renderElement(game);

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
            onSelectTile={new Game().onSelectTile}
            onHoverTile={new Game().onHoverTile}
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
});
