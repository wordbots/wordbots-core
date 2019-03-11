import * as React from 'react';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';

import { MAX_Z_INDEX } from '../../constants.ts';
import { isFlagSet, toggleFlag } from '../../util/browser.tsx';
import Tooltip from '../Tooltip';

export default class SoundToggle extends React.Component {
  handleClick = () => {
    toggleFlag('sound');
    this.forceUpdate();
  }

  render() {
    return (
      <Tooltip text={isFlagSet('sound') ? 'Mute' : 'Unmute'} place="right" style={{ zIndex: MAX_Z_INDEX }} additionalStyles={{ width: 36 }}>
        <IconButton
          style={{
            border: '2px solid #AAA',
            background: '#000',
            borderRadius: '50%',
            padding: 0,
            height: 36,
            width: 36,
            marginBottom: 10
          }}
          onClick={this.handleClick}
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
