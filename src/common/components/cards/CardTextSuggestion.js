import React, { Component } from 'react';
import { func, string } from 'prop-types';

export default class CardTextSuggestion extends Component {
  static propTypes = {
    original: string,
    suggestion: string,
    onChooseSuggestion: func
  }

  handleClick = () => {
    const { original, suggestion, onChooseSuggestion } = this.props;
    onChooseSuggestion(original, suggestion);
  }

  render = () => (
    <span>
      &nbsp;
      <a onClick={this.handleClick} style={{cursor: 'pointer', textDecoration: 'underline'}}>
        {this.props.suggestion}
      </a>
      &nbsp;
    </span>
  );
}
