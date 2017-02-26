export const SET_NAME = 'SET_NAME';
export const SET_TYPE = 'SET_TYPE';
export const SET_TEXT = 'SET_TEXT';
export const PARSE_COMPLETE = 'PARSE_COMPLETE';

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

export function setText(text) {
  return {
    type: SET_TEXT,
    payload: {
      text: text
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



