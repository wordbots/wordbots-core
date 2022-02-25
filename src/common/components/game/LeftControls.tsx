import * as React from 'react';

import { LEFT_CONTROLS_Z_INDEX } from '../../constants';
import * as w from '../../types';

import FullscreenToggle from './FullscreenToggle';
import SoundToggle from './SoundToggle';
import Timer from './Timer';

interface LeftControlsProps {
  player: w.PlayerColor | 'neither'
  currentTurn: w.PlayerColor | 'draft'
  draft: w.DraftState | null
  isTimerEnabled: boolean
  isMyTurn?: boolean
  isAttackHappening?: boolean
  isWaitingForParse?: boolean
  volume: number
  style?: React.CSSProperties
  onPassTurn: (player: w.PlayerColor) => void
  onSetVolume: (volume: number) => void
  onToggleFullscreen: () => void
}

export default class LeftControls extends React.PureComponent<LeftControlsProps> {
  public render(): JSX.Element {
    const {
      player, currentTurn, draft, isTimerEnabled, isMyTurn, isAttackHappening, isWaitingForParse, volume, style,
      onPassTurn, onSetVolume, onToggleFullscreen
    } = this.props;

    return (
      <div
        className="background"
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginLeft: 20,
          zIndex: LEFT_CONTROLS_Z_INDEX,
          ...style
        }}
      >
        <Timer
          minutes={draft ? 5 : 1}
          seconds={draft ? 0 : 30}
          player={player}
          currentTurn={currentTurn}
          enabled={isTimerEnabled}
          isMyTurn={!!draft || isMyTurn}
          isAttackHappening={isAttackHappening}
          isWaitingForParse={isWaitingForParse}
          onPassTurn={onPassTurn}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            paddingLeft: 10
          }}
        >
          <SoundToggle onSetVolume={onSetVolume} volume={volume} />
          <FullscreenToggle onClick={onToggleFullscreen} />
        </div>
      </div>
    );
  }
}
