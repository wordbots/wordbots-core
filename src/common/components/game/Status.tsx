import Snackbar from '@material-ui/core/Snackbar';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import * as React from 'react';

import { STATUS_Z_INDEX } from '../../constants';

interface StatusProps {
  type: 'error' | 'warning'
  message: string
}

const styles: Record<string, CSSProperties> = {
  root: {
    zIndex: STATUS_Z_INDEX,
    transform: 'translateX(calc(-50% - 128px))'
  },
  message: {
    textTransform: 'uppercase',
    fontWeight: 600,
    fontSize: 16
  }
};

class Status extends React.Component<StatusProps & WithStyles> {
  get color(): string {
    return {
      error: '#F44336',
      warning: '#FFEB3B'
    }[this.props.type] || '#CCC';
  }

  public render(): JSX.Element {
    const { message, classes } = this.props;

    return (
      <Snackbar
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
        classes={{
          root: classes.root
        }}
        open={!!message}
        message={<span style={{ color: this.color }} className={classes.message}>{message}</span>}
      />
    );
  }
}

export default withStyles(styles)(Status);
