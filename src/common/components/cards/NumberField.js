import React, { Component } from 'react';
import TextField from 'material-ui/lib/text-field';

class NumberField extends Component {
  render() {
    return (
      <TextField
        value={this.props.value}
        floatingLabelText={this.props.label}
        style={this.props.style}
        type="number"
        min="0"
        disabled={this.props.disabled}
        onChange={e => { this.props.onChange(parseInt(e.target.value)); }} />
    );
  }
}

NumberField.propTypes = {
  label: React.PropTypes.string,
  value: React.PropTypes.number,
  style: React.PropTypes.object,
  disabled: React.PropTypes.bool,
  onChange: React.PropTypes.func
};

export default NumberField;
