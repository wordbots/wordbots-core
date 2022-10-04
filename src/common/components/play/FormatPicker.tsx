import FormControl from '@material-ui/core/FormControl';
import Icon from '@material-ui/core/Icon';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import * as React from 'react';

import { BUILTIN_FORMATS, GameFormat, SetDraftFormat, SetFormat } from '../../util/formats';
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
    const headerMsg = 'Wordbots offers your choice of different game formats based on the kind of game you want to play:';
    const builtinFormatRows = BUILTIN_FORMATS.map((format: GameFormat) => `<b>${format.displayName}:</b> ${format.description}`).join('<br><br>');
    return `${headerMsg}<br><br>${builtinFormatRows}<br><br><b>Set formats:</b> ${SetFormat.description}<br><br><b>Set Draft formats:</b> ${SetDraftFormat.description}`;
  }

  get isSetDraftFormatSelected(): boolean {
    return this.setDraftFormats.map((f) => f.name).includes(this.props.selectedFormatName);
  }

  get setDraftFormats(): SetDraftFormat[] {
    return this.props.availableFormats.filter((f) => f.name?.startsWith('setDraft(')) as SetDraftFormat[];
  }

  get nonSetDraftFormats(): GameFormat[] {
    return this.props.availableFormats.filter((f) => !f.name?.startsWith('setDraft('));
  }

  public render(): JSX.Element {
    const { selectedFormatName } = this.props;
    return (
      <div style={this.styles.body}>
        <FormControl style={{ width: '100%', marginBottom: 15 }}>
          <InputLabel>Choose a format</InputLabel>
          <Select
            style={this.styles.select}
            name="formats"
            value={this.isSetDraftFormatSelected ? 'setDraft' : selectedFormatName}
            onChange={this.handleSelectFormat}
          >
            {this.nonSetDraftFormats.map((format, idx) =>
              <MenuItem key={idx} value={format.name}>{format.displayName}</MenuItem>
            )}
            {this.setDraftFormats.length > 0 && <MenuItem key="setDraft" value="setDraft">Set Draft</MenuItem>}
          </Select>
        </FormControl>
        {this.isSetDraftFormatSelected && <FormControl style={{ width: '100%', marginBottom: 15 }}>
          <InputLabel>Choose a set to draft</InputLabel>
          <Select
            style={this.styles.select}
            name="formats"
            value={this.isSetDraftFormatSelected ? selectedFormatName : this.setDraftFormats[0].name}
            onChange={this.handleSelectFormat}
          >
            {this.setDraftFormats.map((format, idx) =>
              <MenuItem key={idx} value={format.name}>
                {format.set.name} (by {format.set.metadata.authorName}){format.set.metadata.isPublished ? '' : <em>&nbsp;&nbsp;(unpublished set)</em>}
              </MenuItem>
            )}
          </Select>
        </FormControl>}
        <Tooltip
          html
          place="left"
          className="formats-tooltip"
          text={this.formatsTooltip}
        >
          <Icon className="material-icons" style={this.styles.helpIcon}>help</Icon>
        </Tooltip>
      </div>
    );
  }

  private handleSelectFormat = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const formatName = event.target.value;
    console.log(formatName);
    if (formatName === 'setDraft') {
      console.log(this.setDraftFormats[0].name);
      this.props.onChooseFormat(this.setDraftFormats[0].name);
    } else {
      this.props.onChooseFormat(formatName);
    }
  }
}
