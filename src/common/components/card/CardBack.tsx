import * as React from 'react';
import Paper from '@material-ui/core/Paper';

interface CardBackProps {
  deckLength?: number
  customText?: string
  hoverable?: boolean
}

interface CardBackState {
  hover: boolean
}

export default class CardBack extends React.Component<CardBackProps, CardBackState> {
  public state = {
    hover: false
  };

  public render(): JSX.Element {
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
        style={Object.assign({
          width: 140,
          height: 210,
          marginRight: 10,
          borderRadius: 5,
          backgroundColor: this.state.hover ? '#e91e63' : '#f44336',
          boxSizing: 'border-box',
          padding: 5,
          userSelect: 'none',
          cursor: 'pointer'
        }, style)}
      >
        <div style={{
          writingMode: 'vertical-lr',
          width: 'calc(100% - 50px)',
          height: 'calc(100% - 4px)',
          display: 'flex',
          justifyContent: 'center',
          // alignItems: 'center',
          paddingLeft: 46,
          borderRadius: 5,
          border: '2px solid #FFF'
        }}>
          <div style={{
            color: '#fff',
            fontSize: 26,
            fontFamily: 'Carter One'
          }}>{this.props.customText || 'WORDBOTS'}</div>
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
