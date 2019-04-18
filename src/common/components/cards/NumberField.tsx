import TextField from 'material-ui/TextField';
import * as React from 'react';

interface NumberFieldProps {
  label: string
  value: number
  maxValue: number
  style: React.CSSProperties
  disabled?: boolean
  errorText: string | null
  onChange: (value: number) => void
}

export default class NumberField extends React.Component<NumberFieldProps> {
  public render(): JSX.Element {
    return (
      <TextField
        value={this.props.value}
        floatingLabelText={this.props.label}
        style={this.props.style}
        type="number"
        min={0}
        max={this.props.maxValue || 10}
        disabled={this.props.disabled}
        errorText={this.props.errorText}
        onChange={this.handleChange}
      />
    );
  }

  private handleChange = (_e: React.SyntheticEvent<HTMLElement>, newValue: string) => {
    this.props.onChange(parseInt(newValue, 10));
  }
}
