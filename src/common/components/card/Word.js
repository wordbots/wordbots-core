import React from 'react';

import { id } from '../../util/common';
import { inBrowser } from '../../util/browser';
import Tooltip from '../Tooltip';

function Word(word, keywords, result) {
  if ((result.unrecognizedTokens || []).includes(word.toLowerCase())) {
    return (
      <span key={id()}>
        {' '}<u>{word}</u>
      </span>
    );
  } else if (keywords[word]) {
    if (inBrowser()) {
      return (
        <span key={id()}>
          {' '}<Tooltip inline text={keywords[word]}><b>{word}</b></Tooltip>
        </span>
      );
    } else {
      return (
        <span key={id()}>
          {' '}<b>{word}</b>
        </span>
      );
    }
  } else {
    return (
      <span key={id()}>
        {' '}{word}
      </span>
    );
  }
}

export default Word;
