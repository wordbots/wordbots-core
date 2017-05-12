import React, { Component } from 'react';
import { array } from 'prop-types';

import { inBrowser } from '../../util/common';

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

  get currentSound() {
    return this.props.queue[this.state.idx];
  }

  proceedToNextSound() {
    this.setState({idx: this.state.idx + 1});
  }

  render() {
    if (inBrowser() && this.currentSound) {
      return (
        <Sound
          url={`/static/sound/${this.currentSound}`}
          playStatus={Sound.status.PLAYING}
          onFinishedPlaying={this.proceedToNextSound.bind(this)}/>
      );
    } else {
      return null;
    }
  }
}
