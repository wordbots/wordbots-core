import FormControl from '@material-ui/core/FormControl';
import Icon from '@material-ui/core/Icon';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { compact } from 'lodash';
import * as React from 'react';

import * as w from '../../types';
import { SINGLETON_FORMATS, GameFormat, SetDraftFormat, SetFormat, EverythingDraftFormat } from '../../util/formats';
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
    const singletonFormatRows = SINGLETON_FORMATS.map((format: GameFormat) => `<b>${format.displayName}:</b> ${format.description}`).join('<br><br>');
    const complexFormatRows = `<b>Set:</b> ${SetFormat.description}<br><br><b>Set Draft:</b> ${SetDraftFormat.description}<br><br><b>Everything Draft:</b> ${EverythingDraftFormat.description}`;
    return `${headerMsg}<br><br>${singletonFormatRows}<br><br>${complexFormatRows}`;
  }

  get isSetFormatSelected(): boolean {
    return this.setFormats.map((f) => f.name).includes(this.props.selectedFormatName);
  }

  get isSetDraftFormatSelected(): boolean {
    return this.setDraftFormats.map((f) => f.name).includes(this.props.selectedFormatName);
  }

  get setFormats(): SetFormat[] {
    return this.props.availableFormats.filter((f) => f.name?.startsWith('set(')) as SetFormat[];
  }

  get setDraftFormats(): SetDraftFormat[] {
    return this.props.availableFormats.filter((f) => f.name?.startsWith('setDraft(')) as SetDraftFormat[];
  }

  get everythingDraftFormat(): EverythingDraftFormat | undefined {
    return this.props.availableFormats.find((f) => f.name === 'everythingDraft') as EverythingDraftFormat;
  }

  get singletonFormats(): GameFormat[] {
    return this.props.availableFormats.filter((f) => f.name && !compact([...this.setFormats, ...this.setDraftFormats, this.everythingDraftFormat]).map((fo) => fo.name).includes(f.name));
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
            value={selectedFormatName.split('(')[0]}
            onChange={this.handleSelectFormat}
          >
            {this.singletonFormats.map((format, idx) =>
              <MenuItem key={idx} value={format.name}>{format.displayName}</MenuItem>
            )}
            {this.setFormats.length > 0 && <MenuItem key="set" value="set">Set</MenuItem>}
            {this.setDraftFormats.length > 0 && <MenuItem key="setDraft" value="setDraft">Set Draft</MenuItem>}
            {this.everythingDraftFormat && <MenuItem value={this.everythingDraftFormat.name}>{this.everythingDraftFormat.displayName}</MenuItem>}
          </Select>
        </FormControl>
        {(this.isSetFormatSelected || this.isSetDraftFormatSelected) && <FormControl style={{ width: '100%', marginBottom: 15 }}>
          <InputLabel>Choose a set for this format</InputLabel>
          <Select
            style={this.styles.select}
            name="setFormats"
            value={(this.isSetFormatSelected || this.isSetDraftFormatSelected) ? selectedFormatName : this.setFormats[0].name}
            onChange={this.handleSelectFormat}
          >
            {((this.isSetFormatSelected ? this.setFormats : this.setDraftFormats) as Array<GameFormat & { set: w.Set }>).map((format, idx) =>
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
    if (formatName === 'set') {
      this.props.onChooseFormat(this.setFormats[0].name);
    } else if (formatName === 'setDraft') {
      this.props.onChooseFormat(this.setDraftFormats[0].name);
    } else {
      this.props.onChooseFormat(formatName);
    }
  }
}
