import TextField from '@material-ui/core/TextField';
import * as React from 'react';

interface SearchControlsProps {
  compact?: boolean
  onChange: (searchText: string) => void
}

export default class SearchControls extends React.Component<SearchControlsProps> {
  public shouldComponentUpdate(): boolean {
    return false;
  }

  public render(): JSX.Element {
    return (
      <div>
        {!this.props.compact && (
          <div
            style={{
              fontWeight: 700,
              fontSize: 14,
              marginBottom: 10
            }}
          >
            Search
          </div>
        )}

        <TextField
          placeholder="Enter card name or text"
          style={{ width: '100%', marginBottom: 10 }}
          onChange={this.handleChangeText}
        />
      </div>
    );
  }

  private handleChangeText = (e: React.SyntheticEvent<any>) => {
    this.props.onChange(e.currentTarget.value);
  };
}
