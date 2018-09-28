import * as React from 'react';
import { func, object } from 'prop-types';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

import RouterDialog from '../RouterDialog';

export default class ImportDialog extends React.Component {
  static propTypes = {
    history: object,
    onImport: func
  };

  state = {
    importedJson: ''
  };

  get actions() {
    return [
      <RaisedButton
        primary
        label="Close"
        key="Close"
        onClick={this.close}
        style={{marginRight: 10}} />,
      <RaisedButton
        secondary
        label="Import"
        key="Import"
        onClick={this.handleImport} />
    ];
  }

  close = () => {
    RouterDialog.closeDialog(this.props.history);
  }

  handleChangeText = (evt) => {
    this.setState({importedJson: evt.target.value});
  }

  handleImport = () => {
    this.props.onImport(this.state.importedJson);
    this.close();
  };

  render() {
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
}
