import * as React from 'react';

import { inBrowser, isFlagSet } from '../../util/browser';

const Sound = inBrowser() ? require('react-sound').default : null;
const soundManager = inBrowser() ? require('soundmanager2').soundManager : null;

interface SfxProps {
  queue: string[]
  volume: number
}

interface SfxState {
  idx: number
}

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
    return nextProps.queue.length > this.props.queue.length || nextState.idx > this.state.idx;
  }

  public render(): JSX.Element | null {
    const { volume } = this.props;

    this.disableDebugMode();

    if (this.enabled && this.currentSound) {
      return (
        <Sound
          url={`/static/sound/${this.currentSound}`}
          volume={volume}
          playStatus={Sound.status.PLAYING}
          onFinishedPlaying={this.proceedToNextSound}
        />
      );
    } else {
      return null;
    }
  }

  private disableDebugMode = () => {
    if (soundManager && soundManager.debugMode) {
      soundManager.setup({ debugMode: false });
    }
  }

  private proceedToNextSound = () => {
    this.setState((state) => ({ idx: state.idx + 1 }));
  }
}
