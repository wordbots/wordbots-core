import { History } from 'history';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
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
        <RaisedButton
          primary
          label="Close"
          key="Close"
          onClick={this.close}
          style={{marginRight: 10}}
        />
      ),
      (
        <RaisedButton
          secondary
          label="Import"
          key="Import"
          onClick={this.handleImport}
        />
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
      >
        <TextField
          id="tf"
          multiLine
          floatingLabelText="Exported card JSON"
          style={{width: '100%', wordBreak: 'break-all', wordWrap: 'break-word'}}
          onChange={this.handleChangeText}
        />
      </RouterDialog>
    );
  }

  private close = () => {
    RouterDialog.closeDialog(this.props.history);
  }

  private handleChangeText = (_e: React.SyntheticEvent<HTMLElement>, newText: string) => {
    this.setState({importedJson: newText});
  }

  private handleImport = () => {
    this.props.onImport(this.state.importedJson);
    this.close();
  }
}
