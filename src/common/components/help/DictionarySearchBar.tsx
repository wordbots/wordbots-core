import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import * as React from 'react';

interface DictionarySearchBarProps {
  text: string
  onChange: (searchText: string) => void
}

export default class DictionarySearchBar extends React.Component<DictionarySearchBarProps> {
  public render(): JSX.Element {
    return (
      <div style={{display: 'flex', alignItems: 'center', width: '100%', height: 56}}>
        <TextField
          value={this.props.text}
          label="Search for a term ... "
          style={{ width: '100%', margin: '0 10px', }}
          InputProps={{ style: { color: '#666' } }}
          InputLabelProps={{ style: { color: '#aaa' }}}
          onChange={this.handleChangeText}
        />
        {this.renderClearButton()}
      </div>
    );
  }

  private handleChangeText = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onChange(e.currentTarget.value);
  };
  private handleClickClear = () => { this.props.onChange(''); };

  private renderClearButton(): React.ReactNode {
    if (this.props.text !== '') {
      return (
        <IconButton
          style={{ width: '20%', color: '#eee' }}
          onClick={this.handleClickClear}
        >
          <Icon className="material-icons">backspace</Icon>
        </IconButton>
      );
    }
  }
}
