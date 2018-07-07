import * as React from 'react';
import { string, func, bool, number } from 'prop-types';

import PaperButton from '../PaperButton';

export default class GameMode extends React.Component {
  static propTypes = {
    name: string,
    imagePath: string,
    modesPerRow: number,
    onSelect: func,
    disabled: bool
  };

  static defaultProps = {
    imagePath: '',
    modesPerRow: 2
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
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 100,
          textAlign: 'center',
          fontSize: 24,
          fontFamily: 'Carter One',
          color: '#f44336',
          WebkitTextStroke: '1px black'
        }}>{name}</div>
      </div>
    );
  }

  render() {
    const { modesPerRow, disabled, onSelect } = this.props;
    const widthPercent = `${100 / modesPerRow}%`;
    const widthPadding = ((modesPerRow - 1) * 20) / modesPerRow;

    return (
      <PaperButton
        disabled={disabled}
        onClick={onSelect}
        style={{
          width: `calc(${widthPercent} - ${widthPadding}px)`,
          height: 300,
          position: 'relative',
          marginBottom: 20
        }}
      >
        {this.renderOverlay()}
        {this.renderInner()}
      </PaperButton>
    );
  }
}
