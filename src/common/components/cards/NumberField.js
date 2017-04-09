import React, { Component } from 'react';
import { bool, func, number, object, string } from 'prop-types';
import TextField from 'material-ui/TextField';

export default class NumberField extends Component {
  static propTypes = {
    label: string,
    value: number,
    style: object,
    disabled: bool,
    onChange: func
  };

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
