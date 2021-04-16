import { InputProps } from '@material-ui/core/Input';
import TextField from '@material-ui/core/TextField';
import * as React from 'react';

interface NumberFieldProps {
  label: React.ReactNode
  value: number
  maxValue: number
  style?: React.CSSProperties
  disabled?: boolean
  inputProps?: InputProps
  errorText: string | null
  onChange: (value: number) => void
}

export default class NumberField extends React.Component<NumberFieldProps> {
  public render(): JSX.Element {
    return (
      <TextField
        value={this.props.value}
        label={this.props.label}
        style={this.props.style || {}}
        type="number"
        inputProps={{
          min: 0,
          max: this.props.maxValue || 10,
          ...this.props.inputProps
        } as any}
        InputProps={this.props.inputProps}
        disabled={this.props.disabled}
        error={!!this.props.errorText}
        helperText={this.props.errorText}
        onChange={this.handleChange}
      />
    );
  }

  private handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onChange(parseInt(e.target.value, 10));
  }
}
