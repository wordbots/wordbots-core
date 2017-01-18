const blueCoreCard = {
  name: 'Core',
  img: 'core_blue',
  cost: 0,
  type: 0,
  health: 20,
  speed: 0,
  attack: 0,
  abilities: []
}

const orangeCoreCard = {
  name: 'Core',
  img: 'core_orange',
  cost: 0,
  type: 0,
  health: 20,
  speed: 0,
  attack: 0,
  abilities: []
}

const attackBotCard = {
  name: 'Attack Bot',
  img: 'char',
  cost: 1,
  type: 0,
  health: 1,
  speed: 2,
  attack: 1,
  abilities: []
}

const tankBotCard = {
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
    blue: {
      health: 20,
      mana: {
        used: 0,
        total: 1
      },
      hand: [tankBotCard, attackBotCard],
      selectedCard: null,
      deck: [tankBotCard, tankBotCard, tankBotCard],
      robotsOnBoard: {
        '-4,0,4': {
          hasMoved: false,
          card: blueCoreCard
        },
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
    orange: {
      health: 20,
      mana: {
        used: 0,
        total: 1
      },
      hand: [tankBotCard, attackBotCard],
      selectedCard: null,
      deck: [tankBotCard, tankBotCard, tankBotCard],
      robotsOnBoard: {
        '4,0,-4': {
          hasMoved: false,
          card: orangeCoreCard
        },
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
  currentTurn: 'blue',
  selectedTile: null,
  placingRobot: false,
  status: {
    message: '',
    type: ''
  }
}
