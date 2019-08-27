import TextField from 'material-ui/TextField';
import * as React from 'react';

interface SearchControlsProps {
  onChange: (searchText: string) => void
}

export default class SearchControls extends React.Component<SearchControlsProps> {
  public shouldComponentUpdate(): boolean {
    return false;
  }

  public render(): JSX.Element {
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
          style={{ width: '100%', marginBottom: 10 }}
          onChange={this.handleChangeText}
        />
      </div>
    );
  }

  private handleChangeText = (_e: React.SyntheticEvent<any>, newValue: string) => { this.props.onChange(newValue); };
}
