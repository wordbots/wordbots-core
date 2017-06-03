import React, { Component } from 'react';
import { object, string } from 'prop-types';
import CopyToClipboard from 'react-copy-to-clipboard';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

import RouterDialog from '../RouterDialog';

export default class ExportDialog extends Component {
  static propTypes = {
    history: object,
    text: string
  };

  constructor() {
    super();

    this.state = {
      status: ''
    };
  }

  get actions() {
    return [
      <span key="status" style={{paddingRight: 20, color: '#ff8888'}}>
        {this.state.status}
      </span>,

      <CopyToClipboard
        text={this.props.text}
        key="copy"
        onCopy={() => {
          this.setState({status: 'Copied to clipboard.'});
          this.selectText();
      }}>
        <RaisedButton
          secondary
          label="Copy to Clipboard"
          style={{marginRight: 10}} />
      </CopyToClipboard>,

      <RaisedButton
        primary
        label="Close"
        key="close"
        onTouchTap={this.close} />
    ];
  }

  close = () => {
    this.setState({status: ''}, () => {
      RouterDialog.closeDialog(this.props.history);
    });
  }

  render() {
    return (
      <RouterDialog
        path="export"
        title="Exported Cards"
        history={this.props.history}
        actions={this.actions}
      >
        <TextField
          id="tf"
          ref={(textField) => { this.textField = textField; }}
          multiLine
          rowsMax={10}
          style={{width: '100%', wordBreak: 'break-all', wordWrap: 'break-word'}}
          value={this.props.text}
          onTouchTap={() => { this.textField.select(); }}
        />
      </RouterDialog>
    );
  }
}
