import React, { Component } from 'react';
import { string, func, bool } from 'prop-types';

import PaperButton from '../PaperButton';

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
          textAlign: 'center',
          fontWeight: 100
        }}>UNDER CONSTRUCTION</div>
      );
    }
  }

  renderInner() {
    const { name, disabled, imagePath } = this.props;
    return (
      <div style={{
        filter: disabled ? 'blur(2px)' : null,
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
          {imagePath && <img src={imagePath} style={{width: '100%', imageRendering: 'pixelated'}} />}
        </div>
        <div style={{
          textAlign: 'center',
          fontSize: 32,
          fontFamily: 'Carter One',
          color: '#f44336',
          WebkitTextStroke: '1px black'
        }}>{name}</div>
      </div>
    );
  }

  render() {
    return (
      <PaperButton
        disabled={this.props.disabled}
        onClick={this.props.onSelect}
        style={{
          flexBasis: 'calc(50% - 60px)',
          height: 250,
          margin: 30,
          position: 'relative'
        }}
      >
        {this.renderOverlay()}
        {this.renderInner()}
      </PaperButton>
    );
  }
}
