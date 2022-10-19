import { noop } from 'lodash';
import * as React from 'react';

import PaperButton from '../PaperButton';
import Tooltip from '../Tooltip';

interface GameModeProps {
  name: string | JSX.Element
  imagePath?: string
  explanation?: string
  modesPerRow?: number
  compact?: boolean
  disabled?: boolean
  tooltipText?: string
  wrapper?: (inner: JSX.Element) => JSX.Element
  onSelect?: () => void
}

export default class GameMode extends React.Component<GameModeProps> {
  public render(): JSX.Element {
    const { modesPerRow, disabled, wrapper, onSelect } = this.props;
    const widthPercent = `${100 / (modesPerRow || 1)}%`;
    const widthPadding = (((modesPerRow || 1) - 1) * 20) / (modesPerRow || 1);

    return (
      <PaperButton
        disabled={disabled}
        onClick={onSelect || noop}
        style={{
          width: `calc(${widthPercent} - ${widthPadding}px)`,
          position: 'relative',
          marginBottom: 20
        }}
      >
        {wrapper ? wrapper(this.renderInner()) : this.renderInner()}
      </PaperButton>
    );
  }

  private renderInner(): JSX.Element {
    const { name, imagePath, explanation, compact, disabled, tooltipText } = this.props;
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
              width: 250,
              height: 125,
              margin: '7px 0',
              color: 'grey',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            <img
              src={imagePath || ''}
              style={{ height: '100%' }}
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
            padding: compact ? 0 : '20px 0'
          }}
        >
          <Tooltip html place="bottom" text={tooltipText || ''} disable={!tooltipText}>
            <div
              style={{
                textAlign: 'center',
                fontSize: 24,
                fontFamily: '"Carter One", "Carter One-fallback"',
                color: disabled ? '#ccc' : '#f44336',
                WebkitTextStroke: disabled ? '1px #999' : '1px black'
              }}
            >
              {name}
            </div>
          </Tooltip>
          {explanation &&
            <div
              style={{
                margin: '5px auto',
                width: 250,
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
