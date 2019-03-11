import * as React from 'react';
import { arrayOf, string, number } from 'prop-types';

import { inBrowser, isFlagSet } from '../../util/browser.tsx';

const Sound = inBrowser() ? require('react-sound').default : null;
const soundManager = inBrowser() ? require('soundmanager2').soundManager : null;

export default class Sfx extends React.Component {
  static propTypes = {
    queue: arrayOf(string),
    volume: number
  };

  state = {
    idx: 0
  };

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.queue.length > this.props.queue.length || nextState.idx > this.state.idx;
  }

  get enabled() {
    return inBrowser() && Sound && isFlagSet('sound');
  }

  get currentSound() {
    return this.props.queue[this.state.idx];
  }

  disableDebugMode = () => {
    if (soundManager && soundManager.debugMode) {
      soundManager.setup({ debugMode: false });
    }
  };

  proceedToNextSound = () => {
    this.setState(state => ({ idx: state.idx + 1 }));
  };

  render() {
    const { volume } = this.props;

    this.disableDebugMode();

    if (this.enabled && this.currentSound) {
      return (
        <Sound
          url={`/static/sound/${this.currentSound}`}
          volume={volume}
          playStatus={Sound.status.PLAYING}
          onFinishedPlaying={this.proceedToNextSound} />
      );
    } else {
      return null;
    }
  }
}
