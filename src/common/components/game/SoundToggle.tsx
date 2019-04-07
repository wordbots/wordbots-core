import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import Slider from '@material-ui/lab/Slider';
import * as React from 'react';

import { MAX_Z_INDEX } from '../../constants';
import { isFlagSet, toggleFlag } from '../../util/browser';

import Tooltip from '../Tooltip';

interface SoundToggleBaseProps {
  volume: number,
  onSetVolume: (volume: number) => void
}

type SoundToggleProps = SoundToggleBaseProps & WithStyles;

interface SoundToggleState {
  volumeSliderVisible: boolean
}

class SoundToggle extends React.Component<SoundToggleProps, SoundToggleState> {
  public static styles: Record<string, CSSProperties> = {
    container: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: 10
    },
    iconRoot: {
      border: '2px solid #aaaaaa',
      backgroundColor: '#000000',
      borderRadius: '50%',
      padding: 0,
      height: 36,
      width: 36
    },
    iconColorPrimary: {
      color: '#ffffff'
    },
    volumeSliderContainer: {
      border: '2px solid #aaaaaa',
      borderRadius: 5,
      backgroundColor: '#000000',
      width: 150,
      height: 30,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0 10px',
      marginLeft: 10
    },
    volumeSliderContainerVisible: {
      visibility: 'visible',
      opacity: 1,
    },
    volumeSliderContainerHidden: {
      visibility: 'hidden',
      opacity: 0
    }
  };

  public state = {
    volumeSliderVisible: false
  };

  public render(): JSX.Element {
    const { volume, classes } = this.props;
    const { volumeSliderVisible } = this.state;

    const sliderContainerClasses = [
      'volume-slider',
      classes.volumeSliderContainer,
      volumeSliderVisible ? classes.volumeSliderContainerVisible : classes.volumeSliderContainerHidden
    ].join(' ');

    return (
      <div className={classes.container} onMouseEnter={this.handleButtonMouseEnter} onMouseLeave={this.handleButtonMouseLeave}>
        <Tooltip
          text={isFlagSet('sound') ? 'Mute' : 'Unmute'}
          place="top"
          style={{ zIndex: MAX_Z_INDEX }}
        >
          <IconButton
            color="primary"
            classes={{
              colorPrimary: classes.iconColorPrimary,
              root: classes.iconRoot
            }}
            onClick={this.handleButtonClick}
          >
            <Icon>{isFlagSet('sound') ? 'volume_up' : 'volume_off'}</Icon>
          </IconButton>
        </Tooltip>
        <div className={sliderContainerClasses}>
          <Slider
            step={1}
            value={volume}
            onChange={this.handleSliderChange}
          />
        </div>
      </div>
    );
  }

  private handleButtonClick = (): void => {
    toggleFlag('sound');
    this.forceUpdate();
  }

  private handleButtonMouseEnter = (): void => {
    this.setState({ volumeSliderVisible: true });
  }

  private handleButtonMouseLeave = (): void => {
    this.setState({ volumeSliderVisible: false });
  }

  private handleSliderChange = (_event: React.SyntheticEvent<any>, value: number): void => {
    this.props.onSetVolume(value);
  }
}

export default withStyles(SoundToggle.styles)(SoundToggle);
