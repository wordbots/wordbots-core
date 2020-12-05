import { flatMap, flow, slice, sortBy } from 'lodash/fp';
import TextField from 'material-ui/TextField';
import * as React from 'react';
import { BigramProbs } from 'word-ngrams';

import * as w from '../../types';
import { contractKeywords } from '../../util/cards';
import { bigramNLL } from '../../util/language';

import CardTextSuggestion from './CardTextSuggestion';

interface CardTextFieldProps {
  text: string
  sentences: w.Sentence[]
  error: string | null
  readonly?: boolean
  bigramProbs?: BigramProbs
  onUpdateText: (text: string) => void
}

export default class CardTextField extends React.Component<CardTextFieldProps> {
  get textSuggestions(): Array<{ original: string, suggestion: string }> {
    const { bigramProbs, sentences } = this.props;

    if (!bigramProbs) {
      return [];
    }

    return flow(
      flatMap((s: w.Sentence) =>
        (s.result.suggestions || []).map((suggestion) =>
          ({
            original: s.sentence.trim(),
            suggestion: contractKeywords(suggestion)
          })
        )
      ),
      sortBy(({ suggestion }) => bigramNLL(suggestion, bigramProbs)),
      slice(0, 5)
    )(sentences);
  }

  public render(): JSX.Element {
    return (
      <div>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <div style={{width: '100%'}}>
            <TextField
              multiLine
              disabled={this.props.readonly}
              value={this.props.text}
              floatingLabelText="Card Text"
              style={{width: '100%'}}
              rows={1}
              onChange={this.handleUpdateText}
            />
          </div>
        </div>

        {this.renderTextErrors()}
      </div>
    );
  }

  private handleChooseSuggestion = (original: string, suggestion: string) => {
    const { text, onUpdateText } = this.props;
    onUpdateText(text.replace(original, suggestion));
  }

  private handleUpdateText = (_e: React.SyntheticEvent<HTMLElement>, newValue: string) => {
    this.props.onUpdateText(newValue);
  }

  private renderDidYouMean = () => {
    if (this.textSuggestions.length > 0) {
      return (
        <div style={{marginTop: 5}}>
          Did you mean: {this.textSuggestions.map(({ original, suggestion }) => (
            <CardTextSuggestion
              key={original}
              original={original}
              suggestion={suggestion}
              onChooseSuggestion={this.handleChooseSuggestion}
            />
          ))} ?
        </div>
      );
    }
  }

  private renderTextErrors = () => {
    if (this.props.error) {
      return (
        <div
          style={{
            fontSize: 12,
            lineHeight: '12px',
            color: 'rgb(244, 67, 54)'
          }}
        >
          <div>
            {this.props.error}
          </div>
          {this.renderDidYouMean()}
        </div>
      );
    }
  }
}
