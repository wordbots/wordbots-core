import React, { Component } from 'react';
import { array } from 'prop-types';
import { isEmpty, isEqual } from 'lodash';

import { inBrowser, isFlagSet } from '../../util/browser';

let Sound;
if (inBrowser()) {
  Sound = require('react-sound').default;
}

export default class Sfx extends Component {
  static propTypes = {
    queue: array
  };

  constructor(props) {
    super();

    this.state = {
      idx: 0
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    const newSoundsQueued = !isEmpty(nextProps.queue) && (!isEqual(this.props.queue, nextProps.queue) || this.paused);
    const nextSoundInQueue = nextState.idx > this.state.idx;
    return newSoundsQueued || nextSoundInQueue;
  }

  componentWillReceiveProps(props) {
    this.setState({idx: 0});
  }

  get enabled() {
    return inBrowser() && Sound && isFlagSet('sound');
  }

  get currentSound() {
    return this.props.queue[this.state.idx];
  }

  get paused() {
    return !this.currentSound;
  }

  proceedToNextSound = () => {
    this.setState({idx: this.state.idx + 1});
  }

  render() {
    if (this.enabled && !this.paused) {
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
