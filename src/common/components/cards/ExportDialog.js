import React, { Component } from 'react';
import { bool, func, string } from 'prop-types';
import CopyToClipboard from 'react-copy-to-clipboard';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

export default class ExportDialog extends Component {
  static propTypes = {
    open: bool,
    text: string,
    onClose: func
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
    this.props.onClose();
    this.setState({status: ''});
  }

  render() {
    return (
      <Dialog
        title="Exported Cards"
        modal={false}
        repositionOnUpdate={false}
        open={this.props.open}
        onRequestClose={this.close}
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
      </Dialog>
    );
  }
}
