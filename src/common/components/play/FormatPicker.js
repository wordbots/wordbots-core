import * as React from 'react';
import { func, number } from 'prop-types';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FontIcon from 'material-ui/FontIcon';

import { FORMATS } from '../../store/gameFormats';
import Tooltip from '../Tooltip';

export default class FormatPicker extends React.Component {
  static propTypes = {
    selectedFormatIdx: number,
    onChooseFormat: func
  };

  get styles() {
    return {
      body: {
        position: 'relative'
      },
      select: {
        width: '100%', 
        marginRight: 25
      },
      helpIcon: {
        position: 'absolute',
        top: 10,
        right: 0
      }
    };
  }

  handleSelectFormat = (event) => {
    this.props.onChooseFormat(event.target.value);
  }

  render() {
    return (
      <div style={this.styles.body}>
        <FormControl style={{ width: '100%', marginBottom: 15 }} error={this.noDecks}>
          <InputLabel>Choose a format</InputLabel>
          <Select
            style={this.styles.select}
            name="formats"
            value={this.props.selectedFormatIdx}
            onChange={this.handleSelectFormat}
          >
            {FORMATS.map((format, idx) =>
              <MenuItem key={idx} value={idx}>{format.displayName}</MenuItem>
            )}
          </Select>
        </FormControl>
        <Tooltip
          html
          place="left"
          className="formats-tooltip"
          text={FORMATS.map(f => `<b>${f.displayName}:</b> ${f.description}`).join('<br><br>')}
        >
          <FontIcon className="material-icons" style={this.styles.helpIcon}>help</FontIcon>
        </Tooltip>
      </div>
    );
  }
}
