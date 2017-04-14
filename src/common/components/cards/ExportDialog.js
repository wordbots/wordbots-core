import React, { Component } from 'react';
import { bool, func, string } from 'prop-types';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

export default class ExportDialog extends Component {
  static propTypes = {
    open: bool,
    text: string,
    onClose: func
  };

  get actions() {
    return [
      <RaisedButton
        primary
        label="Close"
        onTouchTap={this.props.onClose} />
    ];
  }

  render() {
    return (
      <Dialog
        title="Exported Cards"
        modal={false}
        open={this.props.open}
        onRequestClose={this.props.onClose}
        actions={this.actions}
      >
        <TextField
          id="tf"
          ref="tf"
          multiLine
          style={{width: '100%'}}
          value={this.props.text}
          onTouchTap={() => { this.refs['tf'].select(); }}
        />
      </Dialog>
    );
  }
}
