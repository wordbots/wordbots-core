import * as React from 'react';

import { inBrowser, isFlagSet, setFlagIfUnset } from '../../util/browser';

const Sound = inBrowser() ? require('react-sound').default : null;
const soundManager = inBrowser() ? require('soundmanager2/script/soundmanager2-nodebug').soundManager : null;

interface SfxProps {
  queue: string[]
  volume: number
}

interface SfxState {
  idx: number
}

// hacky workaround to the fact that sfxQueue is actually mutable for card execution reasons
let CURRENT_SFX_QUEUE_LENGTH = 0;

// Default sound to true
setFlagIfUnset('sound', true);

export default class Sfx extends React.Component<SfxProps, SfxState> {
  public state = {
    idx: 0
  };

  get enabled(): boolean {
    return inBrowser() && Sound && isFlagSet('sound');
  }

  get currentSound(): string | undefined {
    return this.props.queue[this.state.idx];
  }

  public shouldComponentUpdate(nextProps: SfxProps, nextState: SfxState): boolean {
    return nextProps.queue.length > CURRENT_SFX_QUEUE_LENGTH || nextState.idx > this.state.idx;
  }

  public render(): JSX.Element | null {
    const { queue, volume } = this.props;

    if (!inBrowser()) { return null; }

    this.disableDebugMode();

    CURRENT_SFX_QUEUE_LENGTH = queue.length;

    if (this.currentSound) {
      return (
        <Sound
          url={`/static/sound/${this.currentSound}`}
          volume={this.enabled ? volume : 0}
          playStatus={Sound.status.PLAYING}
          onFinishedPlaying={this.proceedToNextSound}
        />
      );
    } else {
      return null;
    }
  }

  private disableDebugMode = () => {
    if (soundManager?.debugMode) {
      soundManager.setup({ debugMode: false });
    }
  }

  private proceedToNextSound = () => {
    this.setState((state) => ({ idx: state.idx + 1 }));
  }
}
