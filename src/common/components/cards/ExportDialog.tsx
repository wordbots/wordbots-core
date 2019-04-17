import { History } from 'history';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import * as React from 'react';
import * as CopyToClipboard from 'react-copy-to-clipboard';

import RouterDialog from '../RouterDialog';

interface ExportDialogProps {
  history: History
  text: string | null
}

interface ExportDialogState {
  status: string
}

export default class ExportDialog extends React.Component<ExportDialogProps, ExportDialogState> {
  public state = {
    status: ''
  };

  get actions(): JSX.Element[] {
    return [
      (
        <span key="status" style={{paddingRight: 20, color: '#ff8888'}}>
          {this.state.status}
        </span>
      ),
      (
        <CopyToClipboard
          text={this.props.text || ''}
          key="copy"
          onCopy={this.handleCopyText}
        >
          <RaisedButton
            secondary
            label="Copy to Clipboard"
            style={{marginRight: 10}}
          />
        </CopyToClipboard>
      ),
      (
        <RaisedButton
          primary
          label="Close"
          key="close"
          onClick={this.close}
        />
      )
    ];
  }

  public render(): JSX.Element {
    const TextFieldUntyped = TextField as any;  // Remove type checking from TextField because we want to pass it an onClick prop.

    return (
      <RouterDialog
        path="export"
        title="Exported Cards"
        history={this.props.history}
        actions={this.actions}
      >
        <TextFieldUntyped
          id="tf"
          ref={(textField: TextField) => { (this as any).textField = textField; /* TODO better ref typing */ }}
          multiLine
          rowsMax={10}
          style={{width: '100%', wordBreak: 'break-all', wordWrap: 'break-word'}}
          value={this.props.text}
          onClick={this.selectText}
        />
      </RouterDialog>
    );
  }

  private close = () => {
    this.setState({status: ''}, () => {
      RouterDialog.closeDialog(this.props.history);
    });
  }

  private selectText = () => {
    (this as any).textField.select();
  }

  private handleCopyText = () => {
    this.setState({status: 'Copied to clipboard.'});
    this.selectText();
  }
}
