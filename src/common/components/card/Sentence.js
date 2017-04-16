import React from 'react';

import { id } from '../../util/common';
import { keywordsInSentence } from '../../util/cards';

import StatusIcon from './StatusIcon';
import Word from './Word';

function Sentence(text, result = {}) {
  const keywords = keywordsInSentence(text, true);
  const color = result.js ? 'green' : (result.error ? 'red' : 'black');

  if (/\S/.test(text)) {
    const phrases = text.split(',');
    return (
      <span key={id()} style={{color: color}}>
        {phrases.map(p => p.split(' ').map(w => Word(w, keywords, result)))
                .reduce((a, b) => [a, ',', b])}
        {text.endsWith(',') ? '' : '.'}
        { StatusIcon(text, result) }
      </span>
    );
  } else {
    return null;
  }
}

export default Sentence;
