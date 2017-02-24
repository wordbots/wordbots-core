import { setUpBoardState, newTurn } from '../test_helpers';
import { createBoard, renderElement, getComponent } from '../react_helpers';
import * as actions from '../../src/common/actions/game';
import { STARTING_PLAYER_HEALTH, GRID_CONFIG } from '../../src/common/constants';
import gameReducer from '../../src/common/reducers/game';
import defaultState from '../../src/common/store/defaultState';
import { attackBotCard } from '../../src/common/store/cards';
import HexGrid from '../../src/common/components/react-hexgrid/HexGrid';
import HexUtils from '../../src/common/components/react-hexgrid/HexUtils';

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

  describe('[Valid movement/attack hexes]', () => {
    let state = setUpBoardState({
      orange: {
        '1,0,-1': attackBotCard,  // This is the piece that will be selected.
        '2,0,-2': attackBotCard
      },
      blue: {
        '0,0,0': attackBotCard,  // Attackable (adjacent to 1,0,-1)
        '-1,0,1': attackBotCard,  // Blocked by the piece at 0,0,0
        '0,-1,1': attackBotCard  // Attackable (via move+attack)
      }
    });
    state = newTurn(state, 'orange');  // Move to next orange turn so Attack Bot can move.
    state = gameReducer(state, actions.setSelectedTile('1,0,-1'));

    let dispatchedAction = null;
    const hexGrid = getComponent(HexGrid, {game: state}, (action => { dispatchedAction = action; }));

    it('are colored as expected', () => {
      expect(hexGrid.props.hexColors).toEqual({
        '-4,0,4': 'blue',  // Blue core
        '0,0,0': 'red',  // Blue piece (can be attacked)
        '0,-1,1': 'red',  // Blue piece (can be attacked)
        '-1,0,1': 'blue',  // Blue piece (blocked from being attacked by the piece at 0,0,0)
        '4,0,-4': 'orange',  // Orange core
        '1,0,-1': 'bright_orange',  // Orange piece (currently selected)
        '2,0,-2': 'bright_orange',  // Orange piece
        // There are 18 hexes within 2 distance of an interior hex, but 5 are blocked off
        // by the pieces at (2,0,-2), (0,0,0), and (0,-1,1), so there should be 13 green hexes.
        '1,-1,0': 'green',
        '1,1,-2': 'green',
        '0,1,-1': 'green',
        '2,-1,-1': 'green',
        '1,-2,1': 'green',
        '2,-2,0': 'green',
        '1,2,-3': 'green',
        '0,2,-2': 'green',
        '2,1,-3': 'green',
        '-1,2,-1': 'green',
        '-1,1,0': 'green',
        '3,-2,-1': 'green',
        '3,-1,-2': 'green'
      });
    });

    it('propagate actions corresponding to color', () => {
      hexGrid.props.hexagons.forEach(hex => {
        const color = hexGrid.props.hexColors[HexUtils.getID(hex)];
        hexGrid.props.actions.onClick(hex);

        if (color == 'green') {
          expect(dispatchedAction.type).toEqual(actions.MOVE_ROBOT);
        } else if (color == 'red') {
          if (HexUtils.getID(hex) == '0,-1,1') {
            // This piece can be attacked via Move+attack.
            expect(dispatchedAction.map(a => a.type)).toEqual([actions.MOVE_ROBOT, actions.ATTACK]);
          } else {
            // This piece can be attacked directly.
            expect(dispatchedAction.type).toEqual(actions.ATTACK);
          }
        } else {
          expect(dispatchedAction.type).toEqual(actions.SET_SELECTED_TILE);
        }
      });
    });
  });

  // TODO test: placement colors, targeting colors
});
