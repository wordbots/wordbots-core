import React from 'react';
import { times } from 'lodash';

import { id } from '../../util/common';
import { keywordsInSentence } from '../../util/cards';

import StatusIcon from './StatusIcon';
import Word from './Word';

function Sentence(text, result = {}) {
  const keywords = keywordsInSentence(text, true);
  const color = result.js ? 'green' : (result.error ? 'red' : 'black');

  if (/\S/.test(text)) {
    const phrases = text.trim().split(',');
    const numInitialNewlines = (text.split(/\w/)[0].match(/\n/g) || []).length;

    return (
      <span key={id()} style={{color: color}}>
        {times(numInitialNewlines, (i) => <br key={i} />)}
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
