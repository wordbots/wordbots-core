import React, { Component } from 'react';
import { bool, func } from 'prop-types';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

export default class ImportDialog extends Component {
  static propTypes = {
    open: bool,
    onClose: func,
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
      <RaisedButton
        primary
        label="Close"
        onTouchTap={this.props.onClose}
        style={{marginRight: 10}} />,
      <RaisedButton
        secondary
        label="Import"
        onTouchTap={() => {
          this.props.onImport(this.state.importedJson);
          this.props.onClose();
        }} />
    ];
  }

  render() {
    return (
      <Dialog
        title="Import Cards"
        modal={false}
        open={this.props.open}
        onRequestClose={this.props.onClose}
        actions={this.actions}
      >
        <TextField
          id="tf"
          multiLine
          floatingLabelText="Exported card JSON"
          style={{width: '100%', wordBreak: 'break-all', wordWrap: 'break-word'}}
          onChange={e => { this.setState({importedJson: e.target.value}); }}
        />
      </Dialog>
    );
  }
}
