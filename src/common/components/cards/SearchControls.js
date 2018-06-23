import * as React from 'react';
import { func } from 'prop-types';
import TextField from 'material-ui/TextField';

export default class SearchControls extends React.Component {
  static propTypes = {
    onChange: func
  };

  shouldComponentUpdate() {
    return false;
  }

  handleChangeText = (event, newValue) => { this.props.onChange(newValue); };

  render() {
    return (
      <div>
        <div style={{
          fontWeight: 700,
          fontSize: 14,
          marginBottom: 10
        }}>Search</div>

        <TextField
          hintText="Enter card name or text"
          style={{marginBottom: 10}}
          onChange={this.handleChangeText}/>
      </div>
    );
  }
}
