import * as React from 'react';

interface CardTextSuggestionProps {
  original: string
  suggestion: string
  onChooseSuggestion: (original: string, suggestion: string) => void
}

export default class CardTextSuggestion extends React.Component<CardTextSuggestionProps> {
  public render(): JSX.Element {
    return (
      <span>
        &nbsp;
        <a onClick={this.handleClick} style={{cursor: 'pointer', textDecoration: 'underline'}}>
          {this.props.suggestion}
        </a>
        &nbsp;
      </span>
    );
  }

  private handleClick = () => {
    const { original, suggestion, onChooseSuggestion } = this.props;
    onChooseSuggestion(original, suggestion);
  }
}
