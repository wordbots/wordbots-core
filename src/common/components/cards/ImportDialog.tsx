import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { History } from 'history';
import * as React from 'react';

import RouterDialog from '../RouterDialog';

interface ImportDialogProps {
  history: History
  onImport: (json: string) => void
}

interface ImportDialogState {
  importedJson: string
}

export default class ImportDialog extends React.Component<ImportDialogProps, ImportDialogState> {
  public state = {
    importedJson: ''
  };

  get actions(): JSX.Element[] {
    return [
      (
        <Button
          key="Close"
          variant="outlined"
          color="primary"
          onClick={this.close}
          style={{marginRight: 10}}
        >
          Close
        </Button>
      ),
      (
        <Button
          key="Import"
          variant="outlined"
          color="secondary"
          onClick={this.handleImport}
        >
          Import
        </Button>
      )
    ];
  }

  public render(): JSX.Element {
    return (
      <RouterDialog
        path="import"
        title="Import Cards"
        history={this.props.history}
        actions={this.actions}
        style={{ width: 700 }}
      >
        <TextField
          id="tf"
          multiline
          label="Exported card JSON"
          style={{width: '100%', wordBreak: 'break-all', wordWrap: 'break-word'}}
          onChange={this.handleChangeText}
        />
      </RouterDialog>
    );
  }

  private close = () => {
    RouterDialog.closeDialog(this.props.history);
  }

  private handleChangeText = (e: React.SyntheticEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    this.setState({ importedJson: e.currentTarget.value });
  }

  private handleImport = () => {
    this.props.onImport(this.state.importedJson);
    this.close();
  }
}
