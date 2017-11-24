import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import screenfull from 'screenfull';

import Tooltip from '../Tooltip';

export default class FullscreenToggle extends Component {
  handleClick = () => {
    this.forceUpdate();

    // TODO come up with a better approach ...
    /* eslint-disable react/no-find-dom-node */
    const gameArea = ReactDOM.findDOMNode(this).parentNode.parentNode.parentNode.parentNode.parentNode;
    /* eslint-enable react/no-find-dom-node */

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
          onTouchTap={this.handleClick}
        >
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
