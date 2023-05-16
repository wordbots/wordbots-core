import { flatMap, times } from 'lodash';
import * as React from 'react';

import * as w from '../../types';
import { keywordsInSentence, splitSentences } from '../../util/cards';
import { id } from '../../util/common';

import StatusIcon from './StatusIcon';
import Word from './Word';

interface SentenceProps {
  text: string
  result: w.ParseResult | null
  color?: 'green' | 'red' | 'black'
}

export default class Sentence extends React.Component<SentenceProps> {
  public static fromText = (text?: string): JSX.Element[] => Sentence.fromTextChunks([{ text }]);

  public static fromTextChunks = (chunks: Array<{ text?: string, color?: 'green' | 'red' | 'black' }>): JSX.Element[] => (
    flatMap(chunks, (({ text, color }, i) =>
      splitSentences(text || '').map((sentence, j) =>
        <Sentence key={`${i}-${j}`} text={sentence} result={null} color={color} />
      )
    ))
  );

  public render(): JSX.Element | null {
    const { color, text, result } = this.props;
    const keywords = keywordsInSentence(text, true);

    if (/\S/.test(text)) {
      const phrases = text.trim().split(',');
      const numInitialNewlines = (text.split(/\w/)[0].match(/\n/g) || []).length;

      return (
        <span
          key={id()}
          style={{
            color: color || ((result as w.SuccessfulParseResult | undefined)?.js ? 'green' : ((result as w.FailedParseResult | undefined)?.error ? 'red' : 'black'))
          }}
        >
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
