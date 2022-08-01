import Paper from '@material-ui/core/Paper';
import * as React from 'react';

interface CardBackProps {
  deckLength?: number
  customText?: string
  hoverable?: boolean
  scale?: number
}

interface CardBackState {
  hover: boolean
}

export default class CardBack extends React.Component<CardBackProps, CardBackState> {
  public state = {
    hover: false
  };

  public render(): JSX.Element {
    const { scale } = this.props;

    let style: React.CSSProperties = {};

    if (this.props.deckLength) {
      style = {
        borderBottom: 'solid #444',
        borderBottomWidth: Math.min((this.props.deckLength - 1) * 2, 16)
      };
    }

    return (
      <Paper
        elevation={2}
        onMouseEnter={this.toggleHover}
        onMouseLeave={this.toggleHover}
        style={{
          width: 140 * (scale || 1),
          height: 210 * (scale || 1),
          marginRight: 10 * (scale || 1),
          borderRadius: 5 * (scale || 1),
          backgroundColor: this.state.hover ? '#e91e63' : '#f44336',
          boxSizing: 'border-box',
          padding: 5 * (scale || 1),
          userSelect: 'none',
          cursor: 'pointer', ...style}}
      >
        <div
          style={{
            writingMode: 'vertical-lr',
            width: `calc(100% - ${50 * (scale || 1)}px)`,
            height: `calc(100% - ${4 * (scale || 1)}px)`,
            display: 'flex',
            justifyContent: 'center',
            // alignItems: 'center',
            paddingLeft: 46 * (scale || 1),
            borderRadius: 5 * (scale || 1),
            border: '2px solid #FFF'
          }}
        >
          <div
            style={{
              color: '#fff',
              fontSize: 26 * (scale || 1),
              fontFamily: '"Carter One", "Carter One-fallback"'
            }}
          >
            {this.props.customText || 'WORDBOTS'}
          </div>
        </div>
      </Paper>
    );
  }

  private toggleHover = () => {
    if (this.props.hoverable) {
      this.setState((state) => ({hover: !state.hover}));
    }
  }
}
