import * as React from 'react';
import { func } from 'prop-types';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import * as screenfull from 'screenfull';

import { MAX_Z_INDEX } from '../../constants.ts';
import Tooltip from '../Tooltip';

export default class FullscreenToggle extends React.Component {
  static propTypes = {
    onClick: func
  }

  handleClick = () => {
    this.props.onClick();
    this.forceUpdate();
  }

  render() {
    return (
      <Tooltip text="Fullscreen" place="right" style={{ zIndex: MAX_Z_INDEX }} additionalStyles={{ width: 36 }}>
        <IconButton
          style={{
            border: '2px solid #AAA',
            background: '#000',
            borderRadius: '50%',
            padding: 0,
            height: 36,
            width: 36
          }}
          onClick={this.handleClick}
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
