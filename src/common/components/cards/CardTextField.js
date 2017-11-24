import React, { Component } from 'react';
import { arrayOf, func, object, string } from 'prop-types';
import TextField from 'material-ui/TextField';
import { chain as _ } from 'lodash';

import { bigramNLL } from '../../util/language';

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
                  ({ original: s.sentence.trim(), new: sugg })
                )
              )
              .sortBy(suggestion => bigramNLL(suggestion.new, bigramProbs))
              .slice(0, 5)
              .value();
    } else {
      return [];
    }
  }

  handleUpdateText = (e) => { this.props.onUpdateText(e.target.value); };

  renderSuggestion = (suggestion) => {
    // TODO Should probably extract this into a separate component since
    // I'm dynamically binding the click handler here?
    const { onUpdateText, text } = this.props;
    const handleClick = () => {
      onUpdateText(text.replace(suggestion.original, suggestion.new));
    };

    return (
      <span key={suggestion.new}>
        &nbsp;
        <a onClick={handleClick} style={{cursor: 'pointer', textDecoration: 'underline'}}>
          {suggestion.new}
        </a>
        &nbsp;
      </span>
    );
  }

  renderDidYouMean = () => {
    if (this.textSuggestions.length > 0) {
      return (
        <div style={{marginTop: 5}}>
          Did you mean: {this.textSuggestions.map(this.renderSuggestion)} ?
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
