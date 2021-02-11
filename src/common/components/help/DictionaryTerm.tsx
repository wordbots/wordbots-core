import ListItem from '@material-ui/core/List';
import * as React from 'react';

interface DictionaryTermProps {
  selected: boolean
  token: string
  onClick: (term: string) => void
}

export default class DictionaryTerm extends React.Component<DictionaryTermProps> {
  public shouldComponentUpdate(nextProps: DictionaryTermProps): boolean {
    return nextProps.token !== this.props.token || nextProps.selected !== this.props.selected;
  }

  public render(): JSX.Element {
    return (
      <ListItem
        onClick={this.handleClick}
        style={{
          padding: 12,
          cursor: 'pointer',
          backgroundColor: this.props.selected ? '#ddd' : '#fff'
        }}
      >
        {this.props.token}
      </ListItem>
    );
  }

  private handleClick = () => {
    this.props.onClick(this.props.token);
  }
}
