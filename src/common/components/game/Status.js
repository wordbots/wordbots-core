import React, { Component } from 'react';
import { string, object } from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Snackbar from '@material-ui/core/Snackbar';

const styles = {
  root: {
    zIndex: 2000,
    transform: 'translateX(calc(-50% - 128px))'
  },
  message: {
    textTransform: 'uppercase',
    fontWeight: 600,
    fontSize: 16
  }
};

class Status extends Component {
  static propTypes = {
    type: string,
    message: string,
    classes: object
  };

  get color() {
    return {
      error: '#F44336',
      warning: '#FFEB3B'
    }[this.props.type] || '#CCC';
  }

  render() {
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
