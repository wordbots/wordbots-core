import React, { Component } from 'react';
import { func, number } from 'prop-types';
import Paper from 'material-ui/Paper';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

import { FORMATS } from '../../store/gameFormats';

export default class FormatPicker extends Component {
  static propTypes = {
    selectedFormatIdx: number,
    onChooseFormat: func
  };

  handleSelectFormat = (e, idx, v) => {
    this.props.onChooseFormat(idx);
  }

  render() {
    return (
      <Paper style={{display: 'flex', flex: 1, padding: 20, marginBottom: 20}}>
        <SelectField
          value={this.props.selectedFormatIdx}
          floatingLabelText="Choose a format"
          style={{width: '100%'}}
          onChange={this.handleSelectFormat}
        >
          {FORMATS.map((format, idx) =>
            <MenuItem key={idx} value={idx} primaryText={`${format.displayName}`}/>
          )}
        </SelectField>
      </Paper>
    );
  }
}
