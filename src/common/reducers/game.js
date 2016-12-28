import * as gameActions from '../actions/game';

let defaultState = {
  players: {
    green: {
      health: 20,
      hand: [{
        name: 'Tank Bot',
        cost: 3,
        type: 0,
        health: 4,
        speed: 1,
        attack: 2,
        abilities: []
      }, {
        name: 'Attack Bot',
        cost: 1,
        type: 0,
        health: 1,
        speed: 2,
        attack: 1,
        abilities: []
      }],
      selectedCard: null,
      deck: [],
      robotsOnBoard: {
        '-1,-3,4': {
          img: 'char',
          hasMoved: false,
          card: {
            name: 'Attack Bot',
            cost: 1,
            type: 0,
            health: 1,
            speed: 2,
            attack: 1,
            abilities: []
          }
        },
        '0,-3,3': {
          img: 'char',
          hasMoved: false,
          card: {
            name: 'Attack Bot',
            cost: 1,
            type: 0,
            health: 1,
            speed: 2,
            attack: 1,
            abilities: []
          }
        },
        '0,-1,1': {
          img: 'char',
          hasMoved: true,
          card: {
            name: 'Attack Bot',
            cost: 1,
            type: 0,
            health: 1,
            speed: 2,
            attack: 1,
            abilities: []
          }
        }
      }
    },
    red: {
      health: 20,
      hand: [],
      selectedCard: null,
      deck: [],
      robotsOnBoard: {
        '0,-4,4': {
          img: 'char_weapon',
          hasMoved: false,
          card: {
            name: 'Tank Bot',
            cost: 3,
            type: 0,
            health: 4,
            speed: 1,
            attack: 2,
            abilities: []
          }
        },
        '0,4,-4': {
          img: 'char',
          hasMoved: false,
          card: {
            name: 'Attack Bot',
            cost: 1,
            type: 0,
            health: 1,
            speed: 2,
            attack: 1,
            abilities: []
          }
        }
      }
    }
  },
  currentTurn: 'green',
  selectedTile: '0,-3,3'
}

export default function game(state = defaultState, action) {
  let newState = Object.assign({}, state);

  switch (action.type) {
    case gameActions.SET_SELECTED_CARD:
      newState.players.green.selectedCard = action.payload.selectedCard;
      return newState;
    case gameActions.SET_SELECTED_TILE:
      newState.selectedTile = action.payload.selectedTile;
      return newState;
    default:
      return state;
  }
}
