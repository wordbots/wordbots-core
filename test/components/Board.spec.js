import { fromPairs } from 'lodash';

import { getDefaultState, combineState, setUpBoardState, newTurn, playObject, playEvent } from '../testHelpers.ts';
import { getComponent } from '../reactHelpers';
import { attackBotCard } from '../data/cards.ts';
import * as actions from '../../src/common/actions/game.ts';
import { BLUE_PLACEMENT_HEXES, ORANGE_PLACEMENT_HEXES, TYPE_CORE, STARTING_PLAYER_HEALTH, GRID_CONFIG } from '../../src/common/constants.ts';
import gameReducer from '../../src/common/reducers/game.ts';
import { blueCoreCard, orangeCoreCard, shockCard } from '../../src/common/store/cards.ts';
import HexGrid from '../../src/common/components/hexgrid/HexGrid.tsx';
import HexUtils from '../../src/common/components/hexgrid/HexUtils.ts';

describe('Board component', () => {
  const DEFAULT_HEX_COLORS = {
    '-3,0,3': 'blue',  // Blue core
    '3,0,-3': 'orange',  // Orange core
    ...(fromPairs(BLUE_PLACEMENT_HEXES.map(hex => [hex, 'blue']))),
    ...(fromPairs(ORANGE_PLACEMENT_HEXES.map(hex => [hex, 'orange'])))
  };

  it('renders the default board state', () => {
    const gridProps = getComponent('GameArea', HexGrid, combineState(getDefaultState())).props;

    expect(gridProps.hexagons).toEqual(HexGrid.generate(GRID_CONFIG).hexagons);

    expect(gridProps.hexColors).toEqual(DEFAULT_HEX_COLORS);

    expect(gridProps.pieces).toEqual({
      '-3,0,3': {
        'id': 'blueCore',
        'card': blueCoreCard,
        'image': {
          'img': 'core_blue'
        },
        'stats': {
          'health': STARTING_PLAYER_HEALTH
        },
        'type': TYPE_CORE,
        'abilities': [],
        'triggers': [],
        'effects': [],
        'attacking': null,
        'isDamaged': false
      },
      '3,0,-3': {
        'id': 'orangeCore',
        'card': orangeCoreCard,
        'image': {
          'img': 'core_orange'
        },
        'stats': {
          'health': STARTING_PLAYER_HEALTH
        },
        'type': TYPE_CORE,
        'abilities': [],
        'triggers': [],
        'effects': [],
        'attacking': null,
        'isDamaged': false
      }
    });
  });

  describe('[Valid placement hexes]', () => {
    const state = gameReducer(getDefaultState(), actions.setSelectedCard(0, 'orange'));

    let dispatchedAction = null;
    const hexGrid = getComponent('GameArea', HexGrid, combineState(state), (action => { dispatchedAction = action; }));

    it('are colored green', () => {
      expect(hexGrid.props.hexColors).toEqual({
        ...DEFAULT_HEX_COLORS,
        '3,-3,0': 'green',  // Valid orange placement hex
        '3,-2,-1': 'green',  // Valid orange placement hex
        '3,-1,-2': 'green',  // Valid orange placement hex
        '2,1,-3': 'green',  // Valid orange placement hex
        '1,2,-3': 'green',  // Valid orange placement hex
        '0,3,-3': 'green'  // Valid orange placement hex
      });
    });

    it('propagate PLACE_CARD actions', () => {
      ORANGE_PLACEMENT_HEXES.forEach(hex => {
        hexGrid.props.actions.onClick(HexUtils.IDToHex(hex));
        expect(dispatchedAction.type).toEqual(actions.PLACE_CARD);
      });
    });
  });

  describe('[Valid movement/attack hexes]', () => {
    let state = setUpBoardState({
      orange: {
        '0,0,0': attackBotCard,  // This is the piece that will be selected.
        '1,0,-1': attackBotCard
      },
      blue: {
        '-1,0,1': attackBotCard,  // Attackable (adjacent to 0,0,0)
        '-2,-1,3': attackBotCard,  // Blocked by the pieces at -1,0,1 and -1,-1,2
        '-1,-1,2': attackBotCard  // Attackable (via move+attack)
      }
    });
    state = newTurn(state, 'orange');  // Move to next orange turn so Attack Bot can move.
    state = gameReducer(state, actions.setSelectedTile('0,0,0', 'orange'));

    let dispatchedAction = null;
    const hexGrid = getComponent('GameArea', HexGrid, combineState(state), (action => { dispatchedAction = action; }));

    it('are colored as expected', () => {
      expect(hexGrid.props.hexColors).toEqual({
        ...DEFAULT_HEX_COLORS,
        '-1,0,1': 'red',  // Blue piece (can be attacked)
        '-1,-1,2': 'red',  // Blue piece (can be attacked)
        '-2,-1,3': 'blue',  // Blue piece (blocked from being attacked by the pieces at 0,0,0 and -1,-1,2)
        '0,0,0': 'bright_orange',  // Orange piece (currently selected)
        '1,0,-1': 'bright_orange',  // Orange piece
        // There are 18 hexes within 2 distance of an interior hex, but 5 are blocked off
        // by the pieces at (1,0,-1), (-1,0,1), and (-1,-1,2), so there should be 13 green hexes.
        '0,-1,1': 'green',
        '0,1,-1': 'green',
        '-1,1,0': 'green',
        '1,-1,0': 'green',
        '0,-2,2': 'green',
        '1,-2,1': 'green',
        '0,2,-2': 'green',
        '-1,2,-1': 'green',
        '1,1,-2': 'green',
        '-2,2,0': 'green',
        '-2,1,1': 'green',
        '2,-2,0': 'green',
        '2,-1,-1': 'green'
      });
    });

    it('propagate actions corresponding to color', () => {
      hexGrid.props.hexagons.forEach(hex => {
        const color = hexGrid.props.hexColors[HexUtils.getID(hex)];
        hexGrid.props.actions.onClick(hex);

        if (color === 'green') {
          expect(dispatchedAction.type).toEqual(actions.MOVE_ROBOT);
        } else if (color === 'red') {
          if (HexUtils.getID(hex) === '-1,-1,2') {
            // This piece can be attacked via Move+attack.
            expect(dispatchedAction.type).toEqual(actions.MOVE_ROBOT);
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

  it('Valid targetable hexes are colored green', () => {
    let state = getDefaultState();
    state = playObject(state, 'orange', attackBotCard, '3,-1,-2');
    state = playEvent(state, 'blue', shockCard, []);

    const hexGrid = getComponent('GameArea', HexGrid, combineState(state));

    expect(hexGrid.props.hexColors).toEqual({
      ...DEFAULT_HEX_COLORS,
      '3,-1,-2': 'green'  // Valid target
    });
  });
});
