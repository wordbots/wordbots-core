import { createBoard, renderElement } from '../react_helpers';
import defaultState from '../../src/common/store/defaultState';

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

    console.log(getHexGridProps(state));
  });
});
