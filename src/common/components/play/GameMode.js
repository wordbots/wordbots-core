import * as React from 'react';
import { string, func, bool, number } from 'prop-types';

import PaperButton from '../PaperButton';

export default class GameMode extends React.Component {
  static propTypes = {
    name: string,
    imagePath: string,
    modesPerRow: number,
    onSelect: func,
    compact: bool,
    disabled: bool
  };

  static defaultProps = {
    imagePath: '',
    modesPerRow: 2
  }

  renderInner() {
    const { name, compact, disabled, imagePath } = this.props;
    return (
      <div style={{
        filter: disabled ? 'blur(2px)' : null,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {imagePath && <div style={{
          height: 165,
          width: '100%',
          marginBottom: 10,
          color: 'grey',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          <img src={imagePath} style={{height: '100%', imageRendering: 'pixelated'}} />
        </div>}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: compact ? 'auto' : (imagePath ? 100 : 250),
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
    const { modesPerRow, compact, disabled, onSelect } = this.props;
    const widthPercent = `${100 / modesPerRow}%`;
    const widthPadding = ((modesPerRow - 1) * 20) / modesPerRow;

    return (
      <PaperButton
        disabled={disabled}
        onClick={onSelect}
        style={{
          width: `calc(${widthPercent} - ${widthPadding}px)`,
          height: compact ? 'auto' : 300,
          position: 'relative',
          marginBottom: 20
        }}
      >
        {this.renderInner()}
      </PaperButton>
    );
  }
}
