import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { History } from 'history';
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
  private textField = React.createRef<any>();

  get actions(): JSX.Element[] {
    return [
      (
        <span key="status" style={{paddingRight: 20, color: '#ff8888'}}>
          {this.state.status}
        </span>
      ),
      (
        <CopyToClipboard
          key="copy"
          text={this.props.text || ''}
          onCopy={this.handleCopyText}
        >
          <Button
            variant="outlined"
            color="secondary"
            style={{marginRight: 10}}
          >
            Copy to Clipboard
          </Button>
        </CopyToClipboard>
      ),
      (
        <Button
          key="close"
          variant="outlined"
          color="primary"
          onClick={this.close}
        >
          Close
        </Button>
      )
    ];
  }

  public render(): JSX.Element {
    return (
      <RouterDialog
        path="export"
        title="Exported Cards"
        history={this.props.history}
        actions={this.actions}
      >
        <div onClick={this.selectText}>
          <TextField
            id="tf"
            inputRef={this.textField}
            multiline
            rowsMax={10}
            style={{width: '100%', wordBreak: 'break-all', wordWrap: 'break-word'}}
            value={this.props.text || ''}
          />
        </div>
      </RouterDialog>
    );
  }

  private close = () => {
    this.setState({status: ''}, () => {
      RouterDialog.closeDialog(this.props.history);
    });
  }

  private selectText = () => {
    this.textField.current.select();
  }

  private handleCopyText = () => {
    this.setState({status: 'Copied to clipboard.'});
    this.selectText();
  }
}
