import React, { Component } from 'react';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';

import { isFlagSet, toggleFlag } from '../../util/browser';

export default class SoundToggle extends Component {

  render() {
    return (
      <IconButton          
        onTouchTap={() => {
          toggleFlag('sound');
          this.forceUpdate();
        }}>
        <FontIcon 
          className="material-icons" 
          color="#AAA" 
          style={{
            border: '2px solid #AAA',
            borderRadius: '50%',
            padding: 4
          }}>
          {isFlagSet('sound') ? 'volume_up' : 'volume_off'}
        </FontIcon>
      </IconButton>
    );
  }
}
