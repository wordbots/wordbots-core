import React from 'react';
import ReactTooltip from 'react-tooltip';

import { id, inBrowser } from '../../util/common';

function Word(word, keywords, result) {
  if ((result.unrecognizedTokens || []).includes(word.toLowerCase())) {
    return (
      <span key={id()}>
        {' '}<u>{word}</u>
      </span>
    );
  } else if (keywords[word]) {
    if (inBrowser()) {
      const tooltipId = id();
      return (
        <span key={id()}>
          {' '}<b data-for={tooltipId} data-tip={keywords[word]}>{word}</b>
          <ReactTooltip id={tooltipId} />
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
