import React from 'react';
import ReactTooltip from 'react-tooltip';

import { id, isHeadless } from '../../util/common';

function Word(word, keywords, result) {
  if ((result.unrecognizedTokens || []).includes(word.toLowerCase())) {
    return (
      <span key={id()}>
        {' '}<u>{word}</u>
      </span>
    );
  } else if (keywords[word]) {
    if (isHeadless()) {
      return (
        <span key={id()}>
          {' '}<b>{word}</b>
        </span>
      );
    } else {
      const tooltipId = id();
      return (
        <span key={id()}>
          {' '}<b data-for={tooltipId} data-tip={`${keywords[word]}.`}>{word}</b>
          <ReactTooltip id={tooltipId} />
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
