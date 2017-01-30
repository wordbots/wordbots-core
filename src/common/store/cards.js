import { TYPE_ROBOT, TYPE_EVENT } from '../constants'

export const blueCoreCard = {
  name: 'Blue Core',
  img: 'core_blue',
  cost: 0,
  type: TYPE_ROBOT,
  stats: {
    health: 20,
    speed: 0,
    attack: 0
  },
  abilities: []
}

export const orangeCoreCard = {
  name: 'Orange Core',
  img: 'core_orange',
  cost: 0,
  type: TYPE_ROBOT,
  stats: {
    health: 20,
    speed: 0,
    attack: 0
  },
  abilities: []
}

export const attackBotCard = {
  name: 'Attack Bot',
  img: 'char',
  cost: 1,
  type: TYPE_ROBOT,
  stats: {
    health: 1,
    speed: 2,
    attack: 1
  },
  abilities: []
}

export const tankBotCard = {
  name: 'Tank Bot',
  img: 'char_weapon',
  cost: 3,
  type: TYPE_ROBOT,
  stats: {
    health: 4,
    speed: 1,
    attack: 2
  },
  abilities: []
}

export const concentrationCard = {
  name: 'Concentration',
  text: 'Draw two cards.',
  cost: 1,
  type: TYPE_EVENT
}
