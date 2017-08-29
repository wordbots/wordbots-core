import React, {Component} from 'react';
import {func} from 'prop-types';
import TextField from 'material-ui/TextField';

export default class SearchControls extends Component {
  static propTypes = {
    onChange: func
  };

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <div>
        <div
          style={{
            fontWeight: 700,
            fontSize: 14,
            marginBottom: 10
          }}
        >
          Search
        </div>

        <TextField
          hintText="Enter card name or text"
          style={{marginBottom: 10}}
          onChange={(event, newValue) => {
            this.props.onChange(newValue);
          }}
        />
      </div>
    );
  }
}
