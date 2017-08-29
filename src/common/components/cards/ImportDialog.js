import React, {Component} from 'react';
import {func, object} from 'prop-types';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

import RouterDialog from '../RouterDialog';

export default class ImportDialog extends Component {
  static propTypes = {
    history: object,
    onImport: func
  };

  constructor(props) {
    super(props);

    this.state = {
      importedJson: ''
    };
  }

  get actions() {
    return [
      <RaisedButton primary label="Close" key="Close" onTouchTap={this.close} style={{marginRight: 10}} />,
      <RaisedButton
        secondary
        label="Import"
        key="Import"
        onTouchTap={() => {
          this.props.onImport(this.state.importedJson);
          this.close();
        }}
      />
    ];
  }

  close = () => {
    RouterDialog.closeDialog(this.props.history);
  };

  render() {
    return (
      <RouterDialog path="import" title="Import Cards" history={this.props.history} actions={this.actions}>
        <TextField
          id="tf"
          multiLine
          floatingLabelText="Exported card JSON"
          style={{width: '100%', wordBreak: 'break-all', wordWrap: 'break-word'}}
          onChange={e => {
            this.setState({importedJson: e.target.value});
          }}
        />
      </RouterDialog>
    );
  }
}
