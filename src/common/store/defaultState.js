let attackBotCard = {
  name: 'Attack Bot',
  img: 'char',
  cost: 1,
  type: 0,
  health: 1,
  speed: 2,
  attack: 1,
  abilities: []
}

let tankBotCard = {
  name: 'Tank Bot',
  img: 'char_weapon',
  cost: 3,
  type: 0,
  health: 4,
  speed: 1,
  attack: 2,
  abilities: []
}

export const defaultState = {
  players: {
    green: {
      health: 20,
      hand: [tankBotCard, attackBotCard],
      selectedCard: null,
      deck: [],
      robotsOnBoard: {
        '-1,-3,4': {
          hasMoved: false,
          card: attackBotCard
        },
        '0,-3,3': {
          hasMoved: false,
          card: attackBotCard
        },
        '0,-1,1': {
          hasMoved: true,
          card: attackBotCard
        }
      }
    },
    red: {
      health: 20,
      hand: [tankBotCard, attackBotCard],
      selectedCard: null,
      deck: [],
      robotsOnBoard: {
        '0,-4,4': {
          hasMoved: false,
          card: tankBotCard
        },
        '0,4,-4': {
          hasMoved: false,
          card: attackBotCard
        }
      }
    }
  },
  currentTurn: 'green',
  selectedTile: '0,-3,3'
}
