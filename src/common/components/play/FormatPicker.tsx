import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import FontIcon from 'material-ui/FontIcon';
import * as React from 'react';

import { BUILTIN_FORMATS, GameFormat, SetFormat } from '../../util/formats';
import Tooltip from '../Tooltip';

interface FormatPickerProps {
  availableFormats: GameFormat[]
  selectedFormatName: string
  onChooseFormat: (formatName: string) => void
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

  get formatsTooltip(): string {
    const builtinFormatRows = BUILTIN_FORMATS.map((format: GameFormat) => `<b>${format.displayName}:</b> ${format.description}`).join('<br><br>');
    return `${builtinFormatRows}<br><br><b>Set formats:</b> ${SetFormat.description}`;
  }

  public render(): JSX.Element {
    const { availableFormats, selectedFormatName } = this.props;
    return (
      <div style={this.styles.body}>
        <FormControl style={{ width: '100%', marginBottom: 15 }}>
          <InputLabel>Choose a format</InputLabel>
          <Select
            style={this.styles.select}
            name="formats"
            value={selectedFormatName}
            onChange={this.handleSelectFormat}
          >
            {availableFormats.map((format, idx) =>
              <MenuItem key={idx} value={format.name}>{format.displayName}</MenuItem>
            )}
          </Select>
        </FormControl>
        <Tooltip
          html
          place="left"
          className="formats-tooltip"
          text={this.formatsTooltip}
        >
          <FontIcon className="material-icons" style={this.styles.helpIcon}>help</FontIcon>
        </Tooltip>
      </div>
    );
  }

  private handleSelectFormat = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.props.onChooseFormat(event.target.value);
  }
}
