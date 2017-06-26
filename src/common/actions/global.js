export const FIREBASE_DATA = 'FIREBASE_DATA';
export const LOGGED_IN = 'LOGGED_IN';
export const LOGGED_OUT = 'LOGGED_OUT';
export const RE_RENDER = 'RE_RENDER';

export function firebaseData(data) {
  return {
    type: FIREBASE_DATA,
    payload: { data }
  };
}

export function loggedIn(user) {
  return {
    type: LOGGED_IN,
    payload: { user }
  };
}

export function loggedOut() {
  return {
    type: LOGGED_OUT
  };
}

export function reRender() {
  return {
    type: RE_RENDER
  };
}
