import React, { Component } from 'react';
import { arrayOf, string } from 'prop-types';

import { inBrowser, isFlagSet } from '../../util/browser';

const Sound = inBrowser() ? require('react-sound').default : null;

export default class Sfx extends Component {
  static propTypes = {
    queue: arrayOf(string)
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

  proceedToNextSound = () => {
    this.setState(state => ({idx: state.idx + 1}));
  }

  render() {
    if (this.enabled && this.currentSound) {
      return (
        <Sound
          url={`/static/sound/${this.currentSound}`}
          volume={45}
          playStatus={Sound.status.PLAYING}
          onFinishedPlaying={this.proceedToNextSound} />
      );
    } else {
      return null;
    }
  }
}
