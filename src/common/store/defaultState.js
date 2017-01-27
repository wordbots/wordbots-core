const blueCoreCard = {
  name: 'Blue Core',
  img: 'core_blue',
  cost: 0,
  type: 0,
  stats: {
    health: 20,
    speed: 0,
    attack: 0
  },
  abilities: []
}

const orangeCoreCard = {
  name: 'Orange Core',
  img: 'core_orange',
  cost: 0,
  type: 0,
  stats: {
    health: 20,
    speed: 0,
    attack: 0
  },
  abilities: []
}

const attackBotCard = {
  name: 'Attack Bot',
  img: 'char',
  cost: 1,
  type: 0,
  stats: {
    health: 1,
    speed: 2,
    attack: 1
  },
  abilities: []
}

const tankBotCard = {
  name: 'Tank Bot',
  img: 'char_weapon',
  cost: 3,
  type: 0,
  stats: {
    health: 4,
    speed: 1,
    attack: 2
  },
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
          stats: blueCoreCard.stats
        },
        '-1,-3,4': {
          hasMoved: false,
          card: attackBotCard,
          stats: attackBotCard.stats
        },
        '1,-3,2': {
          hasMoved: false,
          card: attackBotCard,
          stats: attackBotCard.stats
        },
        '0,-1,1': {
          hasMoved: true,
          card: attackBotCard,
          stats: attackBotCard.stats
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
          stats: orangeCoreCard.stats
        },
        '0,-4,4': {
          hasMoved: false,
          card: tankBotCard,
          stats: tankBotCard.stats
        },
        '0,4,-4': {
          hasMoved: false,
          card: attackBotCard,
          stats: attackBotCard.stats
        }
      }
    }
  },
  currentTurn: 'blue',
  selectedTile: null,
  placingRobot: false,
  hoveredCard: null,
  status: {
    message: '',
    type: ''
  }
}
