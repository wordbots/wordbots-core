import React, {Component} from 'react';
import {bool, func, number, object, string} from 'prop-types';
import TextField from 'material-ui/TextField';

export default class NumberField extends Component {
  static propTypes = {
    label: string,
    value: number,
    maxValue: number,
    style: object,
    disabled: bool,
    errorText: string,
    onChange: func
  };

  static defaultProps = {
    maxValue: 10
  };

  render() {
    return (
      <TextField
        value={this.props.value}
        floatingLabelText={this.props.label}
        style={this.props.style}
        type="number"
        min="0"
        max={this.props.maxValue}
        disabled={this.props.disabled}
        errorText={this.props.errorText}
        onChange={e => {
          this.props.onChange(parseInt(e.target.value));
        }}
      />
    );
  }
}
