import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/lab/Slider';
import * as React from 'react';

import { MAX_Z_INDEX } from '../../constants';

import Tooltip from '../Tooltip';

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 10
  },
  iconRootDeselected: {
    border: '2px solid #aaaaaa',
    backgroundColor: '#000000',
    borderRadius: '50%',
    padding: 0,
    height: 36,
    width: 36
  },
  iconRootSelected: {
    border: '2px solid #aaaaaa',
    backgroundColor: '#444444',
    borderRadius: '50%',
    padding: 0,
    height: 36,
    width: 36,
    color: '#ffffff !important'
  },
  iconColorPrimary: {
    color: '#ffffff'
  },
  volumeSliderContainerVisible: {
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
  volumeSliderContainerHidden: {
    display: 'none'
  }
};

interface VolumeControlBaseProps {
  volume: number,
  onSetVolume: (volume: number) => void
}

type VolumeControlProps = VolumeControlBaseProps & WithStyles;

interface VolumeControlState {
  volumeSliderVisible: boolean
}

class VolumeControl extends React.Component<VolumeControlProps, VolumeControlState> {
  public state = {
    volumeSliderVisible: false
  };

  public handleButtonClick = () => {
    this.setState({ volumeSliderVisible: !this.state.volumeSliderVisible });
  }

  public handleSliderChange = (_event: React.SyntheticEvent<any>, value: number) => {
    this.props.onSetVolume(value);
  }

  public render(): JSX.Element {
    const { volume, classes } = this.props;
    const { volumeSliderVisible } = this.state;

    return (
      <div className={classes.container}>
        <Tooltip text={'Adjust Volume'} place="right" style={{ zIndex: MAX_Z_INDEX }}>
          <IconButton
            color="primary"
            classes={{
              colorPrimary: classes.iconColorPrimary,
              root: volumeSliderVisible ? classes.iconRootSelected : classes.iconRootDeselected
            }}
            onClick={this.handleButtonClick}
          >
            <Icon>surround_sound</Icon>
          </IconButton>
        </Tooltip>
        <div className={volumeSliderVisible ? classes.volumeSliderContainerVisible : classes.volumeSliderContainerHidden}>
          <Slider
            step={1}
            value={volume}
            onChange={this.handleSliderChange}
          />
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(VolumeControl);
