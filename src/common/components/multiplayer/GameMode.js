import React, { Component } from 'react';
import { string, func, bool } from 'prop-types';
import Paper from 'material-ui/Paper';

export default class GameMode extends Component {
  static propTypes = {
    name: string,
    imagePath: string,
    onSelect: func,
    disabled: bool
  };

  static defaultProps = {
    imagePath: ''
  }

  constructor(props) {
    super(props);

    this.state = {
      shadow: 1
    };
  }

  onClick() {
    if (!this.props.disabled) {
      this.props.onSelect();
    }
  }

  onMouseOver() {
    if (!this.props.disabled) {
      this.setState({
        shadow: 3
      });
    }
  }

  onMouseOut() {
    this.setState({
      shadow: 1
    });
  }

  renderOverlay() {
    if (this.props.disabled) {
      return (
        <div style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#EEEEEE',
          color: '#000000',
          fontSize: 30,
          opacity: 0.8,
          position: 'absolute',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontWeight: 100
        }}>UNDER CONSTRUCTION</div>
      );
    }
  }

  renderInner() {
    return (
      <div style={{
        filter: this.props.disabled ? 'blur(2px)' : null,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          height: 150,
          width: '100%',
          marginBottom: 10,
          color: 'grey',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img src={this.props.imagePath} style={{width: '100%'}} />
        </div>
        <div style={{
          webkitTextStroke: '1px black',
          color: '#f44336',
          fontSize: 32,
          fontFamily: 'Carter One'
        }}>{this.props.name}</div>
      </div>
    );
  }

  render() {
    return (
      <Paper
        zDepth={this.state.shadow}
        onClick={() => this.onClick()}
        onMouseOver={() => this.onMouseOver()}
        onMouseOut={() => this.onMouseOut()}
        style={{
          flexBasis: 'calc(50% - 60px)',
          height: 250,
          margin: 30,
          position: 'relative',
          cursor: this.props.disabled ? 'auto' : 'pointer'
        }}>
        {this.renderOverlay()}
        {this.renderInner()}
      </Paper>
    );
  }
}
