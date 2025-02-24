import * as w from '../types';

export const SET_NAME = 'SET_NAME';
export const SET_TYPE = 'SET_TYPE';
export const SET_ATTRIBUTE = 'SET_ATTRIBUTE';
export const SET_TEXT = 'SET_TEXT';
export const SET_FLAVOR_TEXT = 'SET_FLAVOR_TEXT';
export const PARSE_COMPLETE = 'PARSE_COMPLETE';
export const REGENERATE_SPRITE = 'REGENERATE_SPRITE';
export const TOGGLE_WILL_CREATE_ANOTHER = 'TOGGLE_WILL_CREATE_ANOTHER';
export const TOGGLE_PRIVATE = 'TOGGLE_PRIVATE';
export const SAVE_CARD = 'SAVE_CARD';
export const ADD_EXISTING_CARD_TO_COLLECTION = 'ADD_EXISTING_CARD_TO_COLLECTION';
export const RESET_CREATOR = 'RESET_CREATOR';
export const SAVE_TEMP_VERSION = 'SAVE_TEMP_VERSION';

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

export function setText(text: string, textSource: w.TextSource): w.Action {
  return {
    type: SET_TEXT,
    payload: { text, textSource }
  };
}

export function setFlavorText(flavorText: string): w.Action {
  return {
    type: SET_FLAVOR_TEXT,
    payload: { flavorText }
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

// Note: This actions is consumed by the cardCreator AND collection reducers!
export function saveCard(props: w.CreatorState): w.Action {
  return {
    type: SAVE_CARD,
    payload: props
  };
}

// Note: This actions is consumed by the cardCreator AND collection reducers!
export function addExistingCardToCollection(card: w.CardInStore): w.Action {
  return {
    type: ADD_EXISTING_CARD_TO_COLLECTION,
    payload: { card }
  };
}

// Note: This actions is consumed by the cardCreator AND collection reducers!
export function resetCreator(): w.Action {
  return {
    type: RESET_CREATOR
  };
}

export function saveTempVersion(card: w.CardInStore | null): w.Action {
  return {
    type: SAVE_TEMP_VERSION,
    payload: { card }
  };
}
