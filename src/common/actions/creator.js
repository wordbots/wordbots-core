export const SET_NAME = 'SET_NAME';
export const SET_TYPE = 'SET_TYPE';
export const SET_ATTACK = 'SET_ATTACK';
export const SET_SPEED = 'SET_SPEED';
export const SET_HEALTH = 'SET_HEALTH';
export const SET_ENERGY = 'SET_ENERGY';
export const SET_TEXT = 'SET_TEXT';
export const PARSE_COMPLETE = 'PARSE_COMPLETE';
export const REGENERATE_SPRITE = 'REGENERATE_SPRITE';
export const ADD_TO_COLLECTION = 'ADD_TO_COLLECTION';

export function setName(name) {
  return {
    type: SET_NAME,
    payload: {
      name: name
    }
  };
}

export function setType(type) {
  return {
    type: SET_TYPE,
    payload: {
      type: type
    }
  };
}

export function setAttack(attack) {
  return {
    type: SET_ATTACK,
    payload: {
      attack: attack
    }
  };
}

export function setSpeed(speed) {
  return {
    type: SET_SPEED,
    payload: {
      speed: speed
    }
  };
}

export function setHealth(health) {
  return {
    type: SET_HEALTH,
    payload: {
      health: health
    }
  };
}

export function setEnergy(energy) {
  return {
    type: SET_ENERGY,
    payload: {
      energy: energy
    }
  };
}

export function setText(sentences) {
  return {
    type: SET_TEXT,
    payload: {
      sentences: sentences
    }
  };
}

export function parseComplete(idx, sentence, result) {
  return {
    type: PARSE_COMPLETE,
    payload: {
      idx: idx,
      sentence: sentence,
      result: result
    }
  };
}

export function regenerateSprite() {
  return {
    type: REGENERATE_SPRITE
  };
}

// Note: This actions is consumed by the cardCreator, collection, AND game reducers!
export function addToCollection(props) {
  return {
    type: ADD_TO_COLLECTION,
    payload: props
  };
}
