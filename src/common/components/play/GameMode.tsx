import { noop } from 'lodash';
import * as React from 'react';

import PaperButton from '../PaperButton';

interface GameModeProps {
  name: string
  imagePath?: string
  explanation?: string
  modesPerRow?: number
  compact?: boolean
  disabled?: boolean
  wrapper?: (inner: JSX.Element) => JSX.Element
  onSelect?: () => void
}

export default class GameMode extends React.Component<GameModeProps> {
  public render(): JSX.Element {
    const { modesPerRow, compact, disabled, wrapper, onSelect } = this.props;
    const widthPercent = `${100 / (modesPerRow || 1)}%`;
    const widthPadding = (((modesPerRow || 1) - 1) * 20) / (modesPerRow || 1);

    return (
      <PaperButton
        disabled={disabled}
        onClick={onSelect || noop}
        style={{
          width: `calc(${widthPercent} - ${widthPadding}px)`,
          height: compact ? 'auto' : 100,
          position: 'relative',
          marginBottom: 20,
          padding: compact ? 0 : '20px 0'
        }}
      >
        {wrapper ? wrapper(this.renderInner()) : this.renderInner()}
      </PaperButton>
    );
  }

  private renderInner(): JSX.Element {
    const { name, imagePath, explanation, compact, disabled } = this.props;
    return (
      <div
        style={{
          padding: compact ? 15 : '0 20px',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {imagePath && (
          <div
            style={{
              width: 200,
              height: 100,
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
            justifyContent: 'center',
            alignItems: 'center',
            width: compact ? '100%' : 'calc(100% - 220px)',
            height: 'auto',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              fontSize: 24,
              fontFamily: 'Carter One',
              color: disabled ? '#ccc' : '#f44336',
              WebkitTextStroke: disabled ? '1px #999' : '1px black'
            }}
          >
            {name}
          </div>
          {explanation &&
            <div
              style={{
                margin: '5px auto',
                width: 300,
                textAlign: 'center',
                fontSize: 14,
                color: '#666'
              }}
            >
              {explanation}
            </div>
          }
        </div>
      </div>
    );
  }
}
