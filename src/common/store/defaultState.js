const coreBaseStats = {
  health: 20,
  speed: 0,
  attack: 0
}

const attackBotBaseStats = {
  health: 1,
  speed: 2,
  attack: 1
}

const tankBotBaseStats = {
  health: 4,
  speed: 1,
  attack: 2
}

const blueCoreCard = {
  name: 'Core',
  img: 'core_blue',
  cost: 0,
  type: 0,
  health: coreBaseStats.health,
  speed: coreBaseStats.speed,
  attack: coreBaseStats.attack,
  abilities: []
}

const orangeCoreCard = {
  name: 'Core',
  img: 'core_orange',
  cost: 0,
  type: 0,
  health: coreBaseStats.health,
  speed: coreBaseStats.speed,
  attack: coreBaseStats.attack,
  abilities: []
}

const attackBotCard = {
  name: 'Attack Bot',
  img: 'char',
  cost: 1,
  type: 0,
  health: attackBotBaseStats.health,
  speed: attackBotBaseStats.speed,
  attack: attackBotBaseStats.attack,
  abilities: []
}

const tankBotCard = {
  name: 'Tank Bot',
  img: 'char_weapon',
  cost: 3,
  type: 0,
  health: tankBotBaseStats.health,
  speed: tankBotBaseStats.speed,
  attack: tankBotBaseStats.attack,
  abilities: []
}

export const defaultState = {
  players: {
    blue: {
      health: 20,
      energy: {
        used: 0,
        total: 1
      },
      hand: [tankBotCard, attackBotCard],
      selectedCard: null,
      deck: [tankBotCard, tankBotCard, tankBotCard],
      robotsOnBoard: {
        '-4,0,4': {
          hasMoved: false,
          card: blueCoreCard,
          stats: coreBaseStats
        },
        '-1,-3,4': {
          hasMoved: false,
          card: attackBotCard,
          stats: attackBotBaseStats
        },
        '0,-3,3': {
          hasMoved: false,
          card: attackBotCard,
          stats: attackBotBaseStats
        },
        '0,-1,1': {
          hasMoved: true,
          card: attackBotCard,
          stats: attackBotBaseStats
        }
      }
    },
    orange: {
      health: 20,
      energy: {
        used: 0,
        total: 1
      },
      hand: [tankBotCard, attackBotCard],
      selectedCard: null,
      deck: [tankBotCard, tankBotCard, tankBotCard],
      robotsOnBoard: {
        '4,0,-4': {
          hasMoved: false,
          card: orangeCoreCard,
          stats: coreBaseStats
        },
        '0,-4,4': {
          hasMoved: false,
          card: tankBotCard,
          stats: tankBotBaseStats
        },
        '0,4,-4': {
          hasMoved: false,
          card: attackBotCard,
          stats: attackBotBaseStats
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
