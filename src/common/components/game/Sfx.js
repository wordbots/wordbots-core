import React, { Component } from 'react';
import { array } from 'prop-types';

import { inBrowser, soundEnabled } from '../../util/common';

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

  componentWillReceiveProps(props) {
    this.setState({idx: 0});
  }

  get enabled() {
    return inBrowser() && Sound && soundEnabled();
  }

  get currentSound() {
    return this.props.queue[this.state.idx];
  }

  proceedToNextSound = () => {
    this.setState({idx: this.state.idx + 1});
  }

  render() {
    if (this.enabled && this.currentSound) {
      return (
        <Sound
          url={`/static/sound/${this.currentSound}`}
          volume={70}
          playStatus={Sound.status.PLAYING}
          onFinishedPlaying={this.proceedToNextSound} />
      );
    } else {
      return null;
    }
  }
}
