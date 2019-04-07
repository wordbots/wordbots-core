import { times } from 'lodash';
import * as React from 'react';

import * as w from '../../types';
import { keywordsInSentence, splitSentences } from '../../util/cards';
import { id } from '../../util/common';

import StatusIcon from './StatusIcon';
import Word from './Word';

interface SentenceProps {
  text: string
  result: w.ParseResult | null
}

export default class Sentence extends React.Component<SentenceProps> {
  public static fromText = (text?: string): JSX.Element[] => (
    splitSentences(text || '').map((sentence, idx) =>
      <Sentence key={idx} text={sentence} result={null} />
    )
  )

  public render(): JSX.Element | null {
    const { text, result } = this.props;
    const keywords = keywordsInSentence(text, true);
    const color = (result && result.js) ? 'green' : ((result && result.error) ? 'red' : 'black');

    if (/\S/.test(text)) {
      const phrases = text.trim().split(',');
      const numInitialNewlines = (text.split(/\w/)[0].match(/\n/g) || []).length;

      return (
        <span key={id()} style={{ color }}>
          {times(numInitialNewlines, (i) => <br key={i} />)}
          {phrases.map((p) =>
            p.split(' ').map((word) => <Word key={id()} word={word} keywords={keywords} result={result} />)
          ).reduce((a, b) =>
            [...a, <span key={id()}>,</span>, ...b]
          )}
          {text.endsWith(',') ? '' : '.'}
          <StatusIcon text={text} result={result} />
        </span>
      );
    } else {
      return null;
    }
  }
}
