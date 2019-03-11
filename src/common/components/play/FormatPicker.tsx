import * as React from 'react';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FontIcon from 'material-ui/FontIcon';

import { BUILTIN_FORMATS, GameFormat } from '../../util/formats';
import Tooltip from '../Tooltip';

interface FormatPickerProps {
  selectedFormatIdx: number
  onChooseFormat: (formatIdx: number) => void
}

export default class FormatPicker extends React.Component<FormatPickerProps> {
  get styles(): Record<string, React.CSSProperties> {
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
        top: -2,
        right: 0
      }
    };
  }

  public render(): JSX.Element {
    return (
      <div style={this.styles.body}>
        <FormControl style={{ width: '100%', marginBottom: 15 }}>
          <InputLabel>Choose a format</InputLabel>
          <Select
            style={this.styles.select}
            name="formats"
            value={this.props.selectedFormatIdx}
            onChange={this.handleSelectFormat}
          >
            {BUILTIN_FORMATS.map((format, idx) =>
              <MenuItem key={idx} value={idx}>{format.displayName}</MenuItem>
            )}
          </Select>
        </FormControl>
        <Tooltip
          html
          place="left"
          className="formats-tooltip"
          text={BUILTIN_FORMATS.map((format: GameFormat) => `<b>${format.displayName}:</b> ${format.description}`).join('<br><br>')}
        >
          <FontIcon className="material-icons" style={this.styles.helpIcon}>help</FontIcon>
        </Tooltip>
      </div>
    );
  }

  private handleSelectFormat = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.props.onChooseFormat(parseInt(event.currentTarget.value, 10));
  }
}
