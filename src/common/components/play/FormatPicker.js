import * as React from 'react';
import { func, number } from 'prop-types';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
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
        position: 'relative', 
        margin: 10
      },
      select: {
        width: '100%'
      },
      helpIcon: {
        position: 'absolute',
        top: 0,
        right: 0
      }
    };
  }

  handleSelectFormat = (e, idx, v) => {
    this.props.onChooseFormat(idx);
  }

  render() {
    return (
      <div style={this.styles.body}>
        <SelectField
          value={this.props.selectedFormatIdx}
          floatingLabelText="Choose a format"
          style={this.styles.select}
          onChange={this.handleSelectFormat}
        >
          {FORMATS.map((format, idx) =>
            <MenuItem key={idx} value={idx} primaryText={`${format.displayName}`}/>
          )}
        </SelectField>
        <Tooltip
          html
          place="right"
          className="formats-tooltip"
          text={FORMATS.map(f => `<b>${f.displayName}:</b> ${f.description}`).join('<br><br>')}
        >
          <FontIcon className="material-icons" style={this.styles.helpIcon}>help</FontIcon>
        </Tooltip>
      </div>
    );
  }
}
