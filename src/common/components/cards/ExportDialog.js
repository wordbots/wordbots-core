import * as React from 'react';
import { object, string } from 'prop-types';
import * as CopyToClipboard from 'react-copy-to-clipboard';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

import RouterDialog from '../RouterDialog.tsx';

export default class ExportDialog extends React.Component {
  static propTypes = {
    history: object,
    text: string
  };

  state = {
    status: ''
  };

  get actions() {
    return [
      <span key="status" style={{paddingRight: 20, color: '#ff8888'}}>
        {this.state.status}
      </span>,

      <CopyToClipboard
        text={this.props.text}
        key="copy"
        onCopy={this.handleCopyText}
      >
        <RaisedButton
          secondary
          label="Copy to Clipboard"
          style={{marginRight: 10}} />
      </CopyToClipboard>,

      <RaisedButton
        primary
        label="Close"
        key="close"
        onClick={this.close} />
    ];
  }

  close = () => {
    this.setState({status: ''}, () => {
      RouterDialog.closeDialog(this.props.history);
    });
  }

  selectText = () => {
    this.textField.select();
  };

  handleCopyText = () => {
    this.setState({status: 'Copied to clipboard.'});
    this.selectText();
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
          onClick={this.selectText}
        />
      </RouterDialog>
    );
  }
}
