import { noop } from 'lodash';
import * as React from 'react';

import PaperButton from '../PaperButton';

interface GameModeProps {
  name: string
  imagePath?: string
  modesPerRow?: number
  compact?: boolean
  disabled?: boolean
  onSelect?: () => void
}

export default class GameMode extends React.Component<GameModeProps> {
  public render(): JSX.Element {
    const { modesPerRow, compact, disabled, onSelect } = this.props;
    const widthPercent = `${100 / (modesPerRow || 2)}%`;
    const widthPadding = (((modesPerRow || 2) - 1) * 20) / (modesPerRow || 2);

    return (
      <PaperButton
        disabled={disabled}
        onClick={onSelect || noop}
        style={{
          width: `calc(${widthPercent} - ${widthPadding}px)`,
          height: compact ? 'auto' : 230,
          position: 'relative',
          marginBottom: 20
        }}
      >
        {this.renderInner()}
      </PaperButton>
    );
  }

  private renderInner(): JSX.Element {
    const { name, compact, disabled, imagePath } = this.props;
    return (
      <div
        style={{
          filter: disabled ? 'blur(2px)' : undefined,
          padding: compact ? 15 : '0 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        {imagePath && (
          <div
            style={{
              height: 165,
              width: '100%',
              color: 'grey',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            <img
              src={imagePath || ''}
              style={{height: '100%', imageRendering: 'pixelated'}}
              alt={`${name} game mode`}
            />
          </div>
        )}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: (compact || imagePath) ? 'auto' : 250,
            textAlign: 'center',
            fontSize: 24,
            fontFamily: 'Carter One',
            color: '#f44336',
            WebkitTextStroke: '1px black'
          }}
        >
          {name}
        </div>
      </div>
    );
  }
}
