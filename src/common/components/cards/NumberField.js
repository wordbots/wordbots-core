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

const { bool, func, number, object, string } = React.PropTypes;

NumberField.propTypes = {
  label: string,
  value: number,
  style: object,
  disabled: bool,
  onChange: func
};

export default NumberField;
