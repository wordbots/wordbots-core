import { newTurn, setUpBoardState } from '../test_helpers';
import { createBoard, renderElement } from '../react_helpers';
import * as actions from '../../src/common/actions/game';
import { STARTING_PLAYER_HEALTH, GRID_CONFIG } from '../../src/common/constants';
import gameReducer from '../../src/common/reducers/game';
import defaultState from '../../src/common/store/defaultState';
import { attackBotCard } from '../../src/common/store/cards';
import HexGrid from '../../src/common/components/react-hexgrid/HexGrid';

describe('Board component', () => {
  function getHexGridProps(state) {
    const board = createBoard(state);
    const rendered = renderElement(board);
    const hexGrid = rendered.props.children;
    return hexGrid.props;
  }

  it('renders the default board state', () => {
    const gridProps = getHexGridProps({game: defaultState});

    expect(gridProps.width).toEqual(GRID_CONFIG.width);
    expect(gridProps.height).toEqual(GRID_CONFIG.height);
    expect(gridProps.hexagons).toEqual(HexGrid.generate(GRID_CONFIG).hexagons);

    expect(gridProps.hexColors).toEqual(
      { '-4,0,4': 'blue', '4,0,-4': 'orange' }
    );

    expect(gridProps.pieceImgs).toEqual(
      { '-4,0,4': {img: 'core_blue'}, '4,0,-4': {img: 'core_orange'} }
    );

    expect(gridProps.pieceStats).toEqual(
      { '-4,0,4': {health: STARTING_PLAYER_HEALTH}, '4,0,-4': {health: STARTING_PLAYER_HEALTH} }
    );
  });

  it('correctly colors valid movement/attack hexes', () => {
    let state = setUpBoardState({
      orange: {
        '1,0,-1': attackBotCard,  // This is the piece that will be selected.
        '2,0,-2': attackBotCard
      },
      blue: {
        '0,0,0': attackBotCard,
        '-1,0,1': attackBotCard
      }
    });
    state = newTurn(state, 'orange');  // Move to next orange turn so Attack Bot can move.
    state = gameReducer(state, actions.setSelectedTile('1,0,-1'));
    const gridProps = getHexGridProps({game: state});

    expect(gridProps.hexColors).toEqual({
      '-4,0,4': 'blue',  // Blue core
      '0,0,0': 'red',  // Blue piece (can be attacked)
      '-1,0,1': 'blue',  // Blue piece (blocked from being attacked by the piece at 0,0,0)
      '4,0,-4': 'orange',  // Orange core
      '1,0,-1': 'bright_orange',  // Orange piece (currently selected)
      '2,0,-2': 'bright_orange',  // Orange piece
      // There are 18 hexes within 2 distance of an interior hex, but 4 are blocked off by the pieces are 2,0,-2 and 0,0,0,
      // so there should be 14 green hexes.
      '1,-1,0': 'green',
      '1,1,-2': 'green',
      '0,1,-1': 'green',
      '2,-1,-1': 'green',
      '1,-2,1': 'green',
      '2,-2,0': 'green',
      '0,-1,1': 'green',
      '1,2,-3': 'green',
      '0,2,-2': 'green',
      '2,1,-3': 'green',
      '-1,2,-1': 'green',
      '-1,1,0': 'green',
      '3,-2,-1': 'green',
      '3,-1,-2': 'green'
    });
  });

  // TODO test: placement colors, targeting colors, green/red tiles always being selectable?
});
