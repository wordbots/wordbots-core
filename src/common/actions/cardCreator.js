export const SET_NAME = 'SET_NAME';

export function setName(name) {
  return {
    type: SET_NAME,
    payload: {
      name: name
    }
  };
}
