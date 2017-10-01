import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';

import Tooltip from '../Tooltip';
import screenfull from '../../util/screenfull';

export default class FullscreenToggle extends Component {
  toggleFullscreen() {
    const gameArea = ReactDOM.findDOMNode(this).parentNode.parentNode.parentNode.parentNode.parentNode;

    screenfull.toggle(gameArea);
  }

  render() {
    return (
      <Tooltip text="Fullscreen" place="bottom" style={{zIndex: 99999}}>  
        <IconButton          
          style={{
            border: '2px solid #AAA',
            background: '#000',
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
            color="#FFF"> 
            {!screenfull.isFullscreen ? 'fullscreen' : 'fullscreen_exit'}
          </FontIcon>
        </IconButton>
      </Tooltip>
    );
  }
}
