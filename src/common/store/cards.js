import { TYPE_ROBOT, TYPE_EVENT, TYPE_CORE } from '../constants'

export const blueCoreCard = {
  name: 'Blue Core',
  img: 'core_blue',
  cost: 0,
  type: TYPE_CORE,
  stats: {
    health: 20
  },
  abilities: []
}

export const orangeCoreCard = {
  name: 'Orange Core',
  img: 'core_orange',
  cost: 0,
  type: TYPE_CORE,
  stats: {
    health: 20
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
  command: '(function () { actions["draw"](targets["self"](), 2); })',
  cost: 1,
  type: TYPE_EVENT
}

export const superchargeCard = {
  name: 'Supercharge',
  text: 'Gain 2 energy.',
  command: '(function () { actions["modifyEnergy"](targets["self"](), function (x) { return x + 2; }); })',
  cost: 0,
  type: TYPE_EVENT
}

export const rampageCard = {
  name: 'Rampage',
  text: 'Give all robots you control +2 attack.',
  command: '(function () { actions["modifyAttribute"](targets["all"](objectsMatchingCondition("robot", conditions["controlledBy"](targets["self"]()))), "attack", function (x) { return x + 2; }); })',
  cost: 3,
  type: TYPE_EVENT
}
