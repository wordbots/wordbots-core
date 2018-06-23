import * as React from 'react';
import { func } from 'prop-types';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';

export default class DictionarySidebar extends React.Component {
  static propTypes = {
    onChange: func
  }

  state = {
    text: ''
  };

  setText = (text) => {
    this.setState({ text }, () => {
      this.props.onChange(text);
    });
  };

  handleChangeText = (evt) => { this.setText(evt.target.value); };
  handleClickClear = () => { this.setText(''); };

  renderClearButton() {
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

  render() {
    return (
      <div style={{display: 'flex', alignItems: 'center',width: '100%', height: 56}}>
        <TextField
          value={this.state.text}
          hintText="Search for a term ... "
          style={{width: '100%', margin: '0 10px'}}
          hintStyle={{color: '#AAA'}}
          inputStyle={{color: '#666'}}
          onChange={this.handleChangeText} />
        {this.renderClearButton()}
      </div>
    );
  }
}
