import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import * as React from 'react';
import * as screenfull from 'screenfull';

import { MAX_Z_INDEX } from '../../constants';
import Tooltip from '../Tooltip';

interface FullscreenToggleProps {
  onClick: () => void
}

export default class FullscreenToggle extends React.Component<FullscreenToggleProps> {
  public render(): JSX.Element {
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
            color="#FFF"
          >
            {!screenfull.isFullscreen ? 'fullscreen' : 'fullscreen_exit'}
          </FontIcon>
        </IconButton>
      </Tooltip>
    );
  }

  private handleClick = () => {
    this.props.onClick();
    this.forceUpdate();
  }
}
