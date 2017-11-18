import React, { Component } from 'react';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';

import { isFlagSet, toggleFlag } from '../../util/browser';
import Tooltip from '../Tooltip';

export default class SoundToggle extends Component {
  handleClick = () => {
    toggleFlag('sound');
    this.forceUpdate();
  }

  render() {
    return (
      <Tooltip text={isFlagSet('sound') ? 'Mute' : 'Unmute'} place="bottom" style={{zIndex: 99999}}>
        <IconButton
          style={{
            border: '2px solid #AAA',
            background: '#000',
            borderRadius: '50%',
            padding: 0,
            height: 36,
            width: 36,
            marginRight: 10
          }}
          onTouchTap={this.handleClick}
        >
          <FontIcon
            className="material-icons"
            color="#FFF">
            {isFlagSet('sound') ? 'volume_up' : 'volume_off'}
          </FontIcon>
        </IconButton>
      </Tooltip>
    );
  }
}
