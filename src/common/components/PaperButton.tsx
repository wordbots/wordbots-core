import * as React from 'react';
import Paper from '@material-ui/core/Paper';

interface PaperButtonProps {
  disabled?: boolean
  onClick: () => void
  style: React.CSSProperties
  children: React.ReactNode
}

interface PaperButtonState {
  shadow: number
}

export default class PaperButton extends React.Component<PaperButtonProps, PaperButtonState> {
  public state = {
    shadow: 1
  };

  public render(): JSX.Element {
    return (
      <Paper
        elevation={this.state.shadow}
        onClick={this.onClick}
        onMouseOver={this.onMouseOver}
        onMouseOut={this.onMouseOut}
        style={Object.assign({cursor: this.props.disabled ? 'auto' : 'pointer'}, this.props.style)}
      >
        {this.props.children}
      </Paper>
    );
  }

  private onClick = () => {
    if (!this.props.disabled) {
      this.props.onClick();
    }
  }

  private onMouseOver = () => {
    if (!this.props.disabled) {
      this.setState({shadow: 10});
    }
  }

  private onMouseOut = () => {
    this.setState({shadow: 1});
  }
}
