import { createBoard, renderElement } from '../react_helpers';
import { STARTING_PLAYER_HEALTH, GRID_CONFIG } from '../../src/common/constants';
import defaultState from '../../src/common/store/defaultState';
import HexGrid from '../../src/common/components/react-hexgrid/HexGrid';

describe('Board component', () => {
  function getHexGridProps(state) {
    const board = createBoard(state);
    const rendered = renderElement(board);
    const hexGrid = rendered.props.children;
    return hexGrid.props;
  }

  it('renders the default board state', () => {
    const state = {game: defaultState};
    const gridProps = getHexGridProps(state);

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
});
