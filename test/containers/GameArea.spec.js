import * as React from 'react';

import { getDefaultState, combineState } from '../testHelpers.ts';
import { renderElement, getComponent, createGameArea } from '../reactHelpers';
import Card from '../../src/common/components/card/Card.tsx';
import Board from '../../src/common/components/game/Board.tsx';
import EventAnimation from '../../src/common/components/game/EventAnimation.tsx';
import PlayerArea from '../../src/common/components/game/PlayerArea.tsx';
import TutorialIntroScreen from '../../src/common/components/game/TutorialIntroScreen.tsx';
import VictoryScreen from '../../src/common/components/game/VictoryScreen.tsx';
import HexGrid from '../../src/common/components/hexgrid/HexGrid.tsx';
import HexUtils from '../../src/common/components/hexgrid/HexUtils.ts';
import * as actions from '../../src/common/actions/game.ts';
import gameReducer from '../../src/common/reducers/game.ts';

describe('GameArea container', () => {
  const getCommonGameAreaComponents = (state, gameInner, dom, tutorialStep) => {
    const gameContents = renderElement(dom.props.children[1].props.children);
    const mainDiv = gameContents.props.children[2];
    const board = mainDiv.props.children;
    const playerArea = gameContents.props.children[1];
    const victoryScreen = gameContents.props.children[5];
    const parsingIndicator = gameContents.props.children[6];

    /* eslint-disable react/jsx-key */
    return [
      gameContents.props.children[0],
      <PlayerArea opponent gameProps={playerArea.props.gameProps} />,
      <div
        className="background"
        ref={mainDiv.ref}
        style={mainDiv.props.style}>
        <Board
          selectedTile={null}
          target={state.game.players.orange.target}
          bluePieces={state.game.players.blue.objectsOnBoard}
          orangePieces={state.game.players.orange.objectsOnBoard}
          player="orange"
          currentTurn="orange"
          playingCardType={null}
          attack={null}
          size={board.props.size}
          isGameOver={false}
          isWaitingForParse={false}
          onSelectTile={board.props.onSelectTile}
          onHoverTile={board.props.onHoverTile}
          onActivateAbility={board.props.onActivateAbility}
          onTutorialStep={board.props.onTutorialStep}
          onEndGame={board.props.onEndGame}
          tutorialStep={tutorialStep}
          />
      </div>,
      <PlayerArea gameProps={playerArea.props.gameProps} />,
      <EventAnimation eventQueue={[]} currentTurn="orange" />,
      <VictoryScreen
        winner={null}
        winnerName={null}
        onClick={victoryScreen.props.onClick} />,
      parsingIndicator
    ];
    /* eslint-enable react/jsx-key */
  };

  it('renders the default game state', () => {
    const state = combineState(getDefaultState());

    const game = createGameArea(state, null);

    // Shallow render two levels deep: GameAreaContainer => GameArea => [rendered content]
    const gameInner = renderElement(game);
    const dom = renderElement(gameInner);

    const gameContents = renderElement(dom.props.children[1].props.children);

    expect(gameContents.props.children).toEqual([
      ...getCommonGameAreaComponents(state, gameInner, dom),
      null
    ]);
  });

  it('renders the default game state in tutorial mode', () => {
    const state = combineState(getDefaultState());

    const testTutorialStep = { idx: 0 };
    const game = createGameArea(state, undefined, { isTutorial: true, tutorialStep: testTutorialStep });

    // Shallow render two levels deep: GameAreaContainer => GameArea => [rendered content]
    const gameInner = renderElement(game);
    const dom = renderElement(gameInner);

    const gameContents = renderElement(dom.props.children[1].props.children);

    // eslint-disable-next-line no-magic-numbers
    const tutorialIntroScreen = gameContents.props.children[7];

    /* eslint-disable react/jsx-key */
    expect(gameContents.props.children).toEqual([
      ...getCommonGameAreaComponents(state, gameInner, dom, testTutorialStep),
      <TutorialIntroScreen onClickEndGame={tutorialIntroScreen.props.onClickEndGame} />
    ]);
    /* eslint-enable react/jsx-key */
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

  it('should start tutorial mode on page load if the URL is /play/tutorial', () => {
    const dispatchedActions = [];
    const state = combineState({...getDefaultState(), started: false});

    function dispatch(action) {
      dispatchedActions.push(action);
    }

    const game = createGameArea(state, dispatch, { location: { pathname: '/play/tutorial' }});
    renderElement(game, true);

    expect(dispatchedActions.pop()).toEqual(
      actions.startTutorial()
    );
  });

  describe('should start practice mode on page load if the URL is /play/practice/[deckId]', () => {
    const dispatchedActions = [];
    const state = combineState({...getDefaultState(), started: false});
    const historyParams = {
      location: { pathname: '/play/practice/deckId' },
      match: { params: { deck: 'deckId', format: 'normal' } },
      history: { push: (url) => dispatchedActions.push({ type: 'HISTORY.PUSH', payload: { url } }) }
    };

    function dispatch(action) {
      dispatchedActions.push(action);
    }

    it('should redirect to /play if the deck doesn\'t exist', () => {
      const game = createGameArea(state, dispatch, {...historyParams, collection: {
        decks: []
      }});
      renderElement(game, true);

      expect(dispatchedActions.pop()).toEqual(
        { type: 'HISTORY.PUSH', payload: { url: '/play' } }
      );
    });

    it('should start a practice game if the deck exists', () => {
      const game = createGameArea(state, dispatch, {...historyParams, collection: {
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
