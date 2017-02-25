export const SET_NAME = 'SET_NAME';
export const SET_TYPE = 'SET_TYPE';

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

