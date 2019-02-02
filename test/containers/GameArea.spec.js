import * as React from 'react';

import { getDefaultState, combineState } from '../testHelpers.ts';
import { renderElement, getComponent, createGameArea } from '../reactHelpers';
import Card from '../../src/common/components/card/Card.tsx';
import Board from '../../src/common/components/game/Board';
import EventAnimation from '../../src/common/components/game/EventAnimation';
import PlayerArea from '../../src/common/components/game/PlayerArea';
import VictoryScreen from '../../src/common/components/game/VictoryScreen';
import HexGrid from '../../src/common/components/hexgrid/HexGrid';
import HexUtils from '../../src/common/components/hexgrid/HexUtils';
import * as actions from '../../src/common/actions/game.ts';
import gameReducer from '../../src/common/reducers/game.ts';
import { BOARD_Z_INDEX } from '../../src/common/constants.ts';

describe('GameArea container', () => {
  it('renders the default game state', () => {
    const state = combineState(getDefaultState());

    const game = createGameArea(state);

    // Shallow render two levels deep: GameAreaContainer => GameArea => [rendered content]
    const gameInner = renderElement(game);
    const dom = renderElement(gameInner);

    const paper = dom.props.children[1];
    const mainDiv = paper.props.children[2];
    const board = mainDiv.props.children;
    const victoryScreen = paper.props.children[5];

    /* eslint-disable react/jsx-key */
    expect(paper.props.children).toEqual([
      paper.props.children[0],
      <PlayerArea opponent gameProps={gameInner.props} />,
      <div
        className="background"
        ref={mainDiv.ref}
        style={{
          position: 'absolute',
          left: 0, top: 75, bottom: 75, right: 0,
          margin: '0 auto',
          width: 1000,
          zIndex: BOARD_Z_INDEX
      }}>
        <Board
          selectedTile={null}
          target={state.game.players.orange.target}
          bluePieces={state.game.players.blue.robotsOnBoard}
          orangePieces={state.game.players.orange.robotsOnBoard}
          player={'orange'}
          currentTurn={'orange'}
          playingCardType={null}
          attack={null}
          size={1000}
          isGameOver={false}
          onSelectTile={board.props.onSelectTile}
          onHoverTile={board.props.onHoverTile}
          onActivateAbility={board.props.onActivateAbility}
          onTutorialStep={board.props.onTutorialStep}
          onEndGame={board.props.onEndGame}
          />
      </div>,
      <PlayerArea gameProps={gameInner.props} />,
      <EventAnimation eventQueue={[]} currentTurn="orange" />,
      <VictoryScreen
        winnerColor={null}
        winnerName={null}
        onClick={victoryScreen.props.onClick} />
    ]);
  });
  /* eslint-enable react/jsx-key */

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

    // Set selected card.
    expect(
      clickCard(c => c.props.visible && c.props.name === 'Attack Bot')
    ).toEqual(
      actions.setSelectedCard(0, 'orange')
    );

    // Place object.
    expect(
      clickHex('3,-1,-2')
    ).toEqual(
      actions.placeCard('3,-1,-2', 0)
    );

    dispatch(actions.passTurn('orange'));
    dispatch(actions.passTurn('blue'));

    // Set selected tile.
    expect(
      clickHex('3,-1,-2')
    ).toEqual(
      actions.setSelectedTile('3,-1,-2', 'orange')
    );

    // Move.
    expect(
      clickHex('2,0,-2')
    ).toEqual(
      actions.moveRobot('3,-1,-2', '2,0,-2')
    );

    // TODO attack.
  });

  it('should start tutorial mode on page load if the URL is /singleplayer/tutorial', () => {
    const dispatchedActions = [];
    const state = combineState({...getDefaultState(), started: false});

    function dispatch(action) {
      dispatchedActions.push(action);
    }

    const game = createGameArea(state, dispatch, { location: { pathname: '/singleplayer/tutorial' }});
    renderElement(game, true);

    expect(dispatchedActions.pop()).toEqual(
      actions.startTutorial()
    );
  });

  describe('should start practice mode on page load if the URL is /singleplayer/practice/[deckId]', () => {
    const dispatchedActions = [];
    const state = combineState({...getDefaultState(), started: false});
    const historyParams = {
      location: { pathname: '/singleplayer/practice/deckId' },
      match: { params: { deck: 'deckId' } },
      history: { push: (url) => dispatchedActions.push({ type: 'HISTORY.PUSH', payload: { url } }) }
    };

    function dispatch(action) {
      dispatchedActions.push(action);
    }

    it('should do nothing if collection.firebaseLoaded = false', () => {
      const game = createGameArea(state, dispatch, {...historyParams, collection: {
        firebaseLoaded: false
      }});
      renderElement(game, true);

      expect(dispatchedActions.length).toEqual(0);
    });

    it('should redirect to /singleplayer if collection.firebaseLoaded = true but the deck doesn\'t exist', () => {
      const game = createGameArea(state, dispatch, {...historyParams, collection: {
        firebaseLoaded: true,
        decks: []
      }});
      renderElement(game, true);

      expect(dispatchedActions.pop()).toEqual(
        { type: 'HISTORY.PUSH', payload: { url: '/singleplayer' } }
      );
    });

    it('should start a practice game if collection.firebaseLoaded = true and the deck exists', () => {
      const game = createGameArea(state, dispatch, {...historyParams, collection: {
        firebaseLoaded: true,
        cards: state.collection.cards,
        decks: [{ id: 'deckId', cardIds: ['builtin/One Bot', 'builtin/Two Bot'] }]
      }});
      renderElement(game, true);

      const action = dispatchedActions.pop();
      expect(action.type).toEqual(actions.START_PRACTICE);
      expect(action.payload.deck.map(c => c.name).sort()).toEqual(['One Bot', 'Two Bot']);
    });
  });
});
