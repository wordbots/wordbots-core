import TextField from '@material-ui/core/TextField';
import { debounce } from 'lodash';
import { flatMap, flow, slice, sortBy } from 'lodash/fp';
import * as React from 'react';
import { BigramProbs } from 'word-ngrams';

import * as w from '../../types';
import { contractKeywords } from '../../util/cards';
import { bigramNLL } from '../../util/language';

import CardTextSuggestion from './CardTextSuggestion';

interface CardTextFieldProps {
  text: string
  textSource: w.TextSource
  sentences: w.Sentence[]
  error: string | null
  readonly?: boolean
  bigramProbs?: BigramProbs
  debounceMs: number
  onUpdateText: (text: string, textSource: w.TextSource) => void
}

interface CardTextFieldState {
  currentText: string
  debouncedUpdateFn: (text: string, textSource: w.TextSource) => void
}

export default class CardTextField extends React.Component<CardTextFieldProps, CardTextFieldState> {
  state = {
    currentText: this.props.text,
    debouncedUpdateFn: debounce(this.props.onUpdateText, this.props.debounceMs)
  };

  get textSuggestions(): Array<{ original: string, suggestion: string }> {
    const { bigramProbs, sentences } = this.props;

    if (!bigramProbs) {
      return [];
    }

    return flow(
      flatMap((s: w.Sentence) =>
        ((s.result as w.FailedParseResult).suggestions || []).map((suggestion) =>
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

  public UNSAFE_componentWillReceiveProps(nextProps: CardTextFieldProps): void {
    if (nextProps.text !== this.state.currentText && nextProps.textSource !== 'input') {
      this.setState({ currentText: nextProps.text });
    }
  }


  public render(): JSX.Element {
    const { error } = this.props;

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ width: '100%' }}>
            <TextField
              multiline
              variant="outlined"
              className={`card-creator-text-field ${error && 'error'}`}
              disabled={this.props.readonly}
              value={this.state.currentText}
              label="Card Text"
              style={{ width: '100%' }}
              rows={2}
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
    onUpdateText(text.replace(original, suggestion), 'didYouMean');
  }

  private handleUpdateText = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const currentText = e.currentTarget.value;
    this.setState({ currentText }, () => {
      this.state.debouncedUpdateFn(currentText, 'input');
    });
  }

  private renderDidYouMean = () => {
    if (this.textSuggestions.length > 0) {
      return (
        <div style={{ marginTop: 5 }}>
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
