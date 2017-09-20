import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';

import screenfull from '../../util/screenfull';

export default class FullscreenToggle extends Component {
  toggleFullscreen() {
    const gameArea = ReactDOM.findDOMNode(this).parentNode.parentNode.parentNode.parentNode.parentNode;

    screenfull.toggle(gameArea);
  }

  render() {
    return (
      <IconButton          
        style={{
          border: '2px solid #AAA',
          borderRadius: '50%',
          padding: 0,
          height: 36,
          width: 36
        }}
        onTouchTap={() => {
          this.forceUpdate();
          this.toggleFullscreen();
        }}>
        <FontIcon 
          className="material-icons" 
          color="#AAA"> 
          {!screenfull.isFullscreen ? 'fullscreen' : 'fullscreen_exit'}
        </FontIcon>
      </IconButton>
    );
  }
}
