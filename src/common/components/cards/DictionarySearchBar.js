import React, {Component} from 'react';
import {func} from 'prop-types';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';

export default class DictionarySidebar extends Component {
  static propTypes = {
    onChange: func
  };

  constructor (props) {
    super(props);

    this.state = {
      text: ''
    };
  }

  setText = text => {
    this.setState({text}, () => {
      this.props.onChange(text);
    });
  };

  renderClearButton () {
    if (this.state.text !== '') {
      return (
        <IconButton
          style={{width: '20%'}}
          onClick={() => {
            this.setText('');
          }}
        >
          <FontIcon color="#eee" className="material-icons">
            backspace
          </FontIcon>
        </IconButton>
      );
    }
  }

  render () {
    return (
      <div style={{display: 'flex', alignItems: 'center', width: '100%', height: 56}}>
        <TextField
          value={this.state.text}
          hintText="Search for a term ... "
          style={{width: '100%', margin: '0 10px'}}
          hintStyle={{color: '#AAA'}}
          inputStyle={{color: '#666'}}
          onChange={e => {
            this.setText(e.target.value);
          }}
        />
        {this.renderClearButton()}
      </div>
    );
  }
}
