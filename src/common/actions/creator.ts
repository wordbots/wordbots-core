import * as w from '../types';

export const SET_NAME = 'SET_NAME';
export const SET_TYPE = 'SET_TYPE';
export const SET_ATTRIBUTE = 'SET_ATTRIBUTE';
export const SET_TEXT = 'SET_TEXT';
export const PARSE_COMPLETE = 'PARSE_COMPLETE';
export const REGENERATE_SPRITE = 'REGENERATE_SPRITE';
export const TOGGLE_WILL_CREATE_ANOTHER = 'TOGGLE_WILL_CREATE_ANOTHER';
export const TOGGLE_PRIVATE = 'TOGGLE_PRIVATE';
export const SAVE_CARD = 'SAVE_CARD';
export const RESET_CARD_CREATOR = 'RESET_CARD_CREATOR';

export function setName(name: string): w.Action {
  return {
    type: SET_NAME,
    payload: { name }
  };
}

export function setType(type: w.CardType): w.Action {
  return {
    type: SET_TYPE,
    payload: { type }
  };
}

export function setAttribute(attr: w.Attribute | 'cost', value: number): w.Action {
  return {
    type: SET_ATTRIBUTE,
    payload: { attr, value }
  };
}

export function setText(text: string): w.Action {
  return {
    type: SET_TEXT,
    payload: { text }
  };
}

export function parseComplete(idx: number, sentence: string, result: w.ParseResult): w.Action {
  return {
    type: PARSE_COMPLETE,
    payload: { idx, sentence, result }
  };
}

export function regenerateSprite(): w.Action {
  return {
    type: REGENERATE_SPRITE
  };
}

export function toggleWillCreateAnother(): w.Action {
  return {
    type: TOGGLE_WILL_CREATE_ANOTHER
  };
}

export function togglePrivate(): w.Action {
  return {
    type: TOGGLE_PRIVATE
  };
}

// Note: This action is consumed by the collection reducer! (TODO move this to collection/actions)
export function saveCard(props: w.CreatorState): w.Action {
  return {
    type: SAVE_CARD,
    payload: props
  };
}

export function resetCardCreator(): w.Action {
  return {
    type: RESET_CARD_CREATOR
  };
}
