import React, {Component} from 'react';
import {bool, number, string} from 'prop-types';
import Paper from 'material-ui/Paper';

export default class CardBack extends Component {
  static propTypes = {
    deckLength: number,
    customText: string,
    hoverable: bool
  };

  constructor(props) {
    super(props);

    this.state = {
      hover: false
    };
  }

  toggleHover() {
    if (this.props.hoverable) {
      this.setState({hover: !this.state.hover});
    }
  }

  render() {
    let style = {};

    if (this.props.deckLength) {
      style = {
        borderBottom: 'solid #444',
        borderBottomWidth: Math.min((this.props.deckLength - 1) * 2, 16)
      };
    }

    return (
      <Paper
        zDepth={2}
        onMouseEnter={this.toggleHover.bind(this)}
        onMouseLeave={this.toggleHover.bind(this)}
        style={Object.assign(
          {
            width: 140,
            height: 210,
            marginRight: 10,
            borderRadius: 5,
            backgroundColor: this.state.hover ? '#e91e63' : '#f44336',
            boxSizing: 'border-box',
            padding: 5,
            userSelect: 'none',
            cursor: 'pointer'
          },
          style
        )}
      >
        <div
          style={{
            writingMode: 'vertical-lr',
            width: 'calc(100% - 50px)',
            height: 'calc(100% - 4px)',
            display: 'flex',
            justifyContent: 'center',
            //alignItems: 'center',
            paddingLeft: 46,
            borderRadius: 5,
            border: '2px solid #FFF'
          }}
        >
          <div
            style={{
              color: '#fff',
              fontSize: 26,
              fontFamily: 'Carter One'
            }}
          >
            {this.props.customText || 'WORDBOTS'}
          </div>
        </div>
      </Paper>
    );
  }
}
