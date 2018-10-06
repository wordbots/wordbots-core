import * as fb from 'firebase';

import * as w from '../types';

export const FIREBASE_DATA = 'FIREBASE_DATA';
export const LOGGED_IN = 'LOGGED_IN';
export const LOGGED_OUT = 'LOGGED_OUT';
export const RE_RENDER = 'RE_RENDER';

export function firebaseData(data: any): w.Action {
  return {
    type: FIREBASE_DATA,
    payload: { data }
  };
}

export function loggedIn(user: fb.User): w.Action {
  return {
    type: LOGGED_IN,
    payload: { user }
  };
}

export function loggedOut(): w.Action {
  return {
    type: LOGGED_OUT
  };
}

export function rerender(): w.Action {
  return {
    type: RE_RENDER
  };
}
