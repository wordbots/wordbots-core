import React, { Component } from 'react';
import { func } from 'prop-types';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';

export default class DictionarySidebar extends Component {
  static propTypes = {
    onChange: func
  }

  constructor(props) {
    super(props);

    this.state = {
      text: ''
    };
  }

  setText = (text) => {
    this.setState({ text }, () => {
      this.props.onChange(text);
    });
  }

  renderClearButton() {
    if (this.state.text !== '') {
      return (
        <IconButton
          style={{width: '20%'}}
          onClick={() => { this.setText(''); }}
        >
          <FontIcon color="#eee" className="material-icons">backspace</FontIcon>
        </IconButton>
      );
    }
  }

  render() {
    return (
      <div style={{display: 'flex', width: '20%'}}>
        <TextField
          value={this.state.text}
          hintText="Search for a term ... "
          style={{width: '80%', margin: '0 10px'}}
          hintStyle={{color: '#eee'}}
          inputStyle={{color: '#eee'}}
          onChange={(e) => { this.setText(e.target.value); }} />
        {this.renderClearButton()}
      </div>
    );
  }
}
