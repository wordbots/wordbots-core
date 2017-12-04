import React, { Component } from 'react';
import { arrayOf, func, object, string } from 'prop-types';
import TextField from 'material-ui/TextField';
import { chain as _ } from 'lodash';

import { bigramNLL } from '../../util/language';

import CardTextSuggestion from './CardTextSuggestion';

export default class CardTextField extends Component {
  static propTypes = {
    text: string,
    sentences: arrayOf(object),
    error: string,
    bigramProbs: object,

    onUpdateText: func
  };

  get textSuggestions() {
    const { bigramProbs, sentences } = this.props;
    if (bigramProbs) {
      return _(sentences)
              .flatMap(s =>
                (s.result.suggestions || []).map(sugg =>
                  ({ original: s.sentence.trim(), suggestion: sugg })
                )
              )
              .sortBy(suggestion => bigramNLL(suggestion.new, bigramProbs))
              .slice(0, 5)
              .value();
    } else {
      return [];
    }
  }

  handleChooseSuggestion = (original, suggestion) => {
    const { text, onUpdateText } = this.props;
    onUpdateText(text.replace(original, suggestion));
  }

  handleUpdateText = (e) => {
    const { onUpdateText } = this.props;
    onUpdateText(e.target.value);
  };

  renderDidYouMean = () => {
    if (this.textSuggestions.length > 0) {
      return (
        <div style={{marginTop: 5}}>
          Did you mean: {this.textSuggestions.map(({ original, suggestion }) => (
            <CardTextSuggestion
              key={original}
              original={original}
              suggestion={suggestion}
              onChooseSuggestion={this.handleChooseSuggestion} />
          ))} ?
        </div>
      );
    }
  }

  renderTextErrors = () => {
    if (this.props.error) {
      return (
        <div style={{
          fontSize: 12,
          lineHeight: '12px',
          color: 'rgb(244, 67, 54)'
        }}>
          <div>
            {this.props.error}
          </div>
          {this.renderDidYouMean()}
        </div>
      );
    }
  }

  render() {
    return (
      <div>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <div style={{width: '100%'}}>
            <TextField
              multiLine
              value={this.props.text}
              floatingLabelText="Card Text"
              style={{width: '100%'}}
              rows={1}
              onChange={this.handleUpdateText} />
          </div>
        </div>

        {this.renderTextErrors()}
      </div>
    );
  }
}
