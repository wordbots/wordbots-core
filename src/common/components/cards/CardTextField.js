import React, { Component } from 'react';
import { array, func, string } from 'prop-types';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

import { findSimilarText } from '../../util/cards';
import { getAllCardText } from '../../util/firebase';

export default class CardTextField extends Component {
  static propTypes = {
    text: string,
    sentences: array,
    error: string,

    onUpdateText: func,
    onOpenDialog: func
  };

  constructor() {
    super();

    this.setState({
      examples: []
    });
  }

  componentDidMount() {
    getAllCardText((examples) => {
      this.setState({ examples });
    });
  }

  get textSuggestions() {
    let suggestions = [];

    this.props.sentences.forEach((s, idx) => {
      const original = s.sentence.trim();
      if (s.result.error === 'Not a valid passive, triggered, or activated ability.') {
        suggestions.push({original: original, new: `Startup: ${original}`});
      } else {
        const similarText = findSimilarText(original, this.state.examples);
        suggestions = suggestions.concat(similarText.map(suggestion => (
          { original: original, new: suggestion }
        )));
      }
    });

    return suggestions.slice(0, 5);
  }

  useSuggestion(suggestion) {
    this.props.onUpdateText(this.props.text.replace(suggestion.original, suggestion.new));
  }

  renderDidYouMean() {
    console.log(this.textSuggestions);
    if (this.textSuggestions.length > 0) {
      return (
        <div style={{marginTop: 5}}>
          Did you mean:
          {
            this.textSuggestions.map(suggestion => (
              <span key={suggestion.new}>
                &nbsp;
                <a
                  onClick={() => { this.useSuggestion(suggestion); }}
                  style={{cursor: 'pointer', textDecoration: 'underline'}}
                >
                  {suggestion.new}
                </a>
                &nbsp;
              </span>
            ))
          }
          ?
        </div>
      );
    }
  }

  renderTextErrors() {
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
          <TextField
            multiLine
            value={this.props.text}
            floatingLabelText="Card Text"
            style={{width: '85%', marginRight: 10}}
            rows={2}
            onChange={e => { this.props.onUpdateText(e.target.value); }} />

          <div>
            <RaisedButton
              label="Help"
              primary
              style={{width: '100%', marginBottom: 8}}
              onClick={() => { this.props.onOpenDialog('help'); }} />
            <RaisedButton
              label="Dictionary"
              primary
              style={{width: '100%'}}
              onClick={() => { this.props.onOpenDialog('dictionary'); }} />
          </div>
        </div>

        {this.renderTextErrors()}
      </div>
    );
  }
}
