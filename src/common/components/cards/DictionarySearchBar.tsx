import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import TextField from 'material-ui/TextField';
import * as React from 'react';

interface DictionarySearchBarProps {
  onChange: (searchText: string) => void
}

interface DictionarySearchBarState {
  text: string
}

export default class DictionarySearchBar extends React.Component<DictionarySearchBarProps, DictionarySearchBarState> {
  public state = {
    text: ''
  };

  public render(): JSX.Element {
    return (
      <div style={{display: 'flex', alignItems: 'center', width: '100%', height: 56}}>
        <TextField
          value={this.state.text}
          hintText="Search for a term ... "
          style={{width: '100%', margin: '0 10px'}}
          hintStyle={{color: '#AAA'}}
          inputStyle={{color: '#666'}}
          onChange={this.handleChangeText}
        />
        {this.renderClearButton()}
      </div>
    );
  }

  private setText = (text: string) => {
    this.setState({ text }, () => {
      this.props.onChange(text);
    });
  }

  private handleChangeText = (_e: React.FormEvent<{}>, value: string) => { this.setText(value); };
  private handleClickClear = () => { this.setText(''); };

  private renderClearButton(): React.ReactNode {
    if (this.state.text !== '') {
      return (
        <IconButton
          style={{width: '20%'}}
          onClick={this.handleClickClear}
        >
          <FontIcon color="#eee" className="material-icons">backspace</FontIcon>
        </IconButton>
      );
    }
  }
}
