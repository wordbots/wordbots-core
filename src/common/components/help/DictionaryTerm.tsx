import { ListItem } from 'material-ui/List';
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
        primaryText={this.props.token}
        onClick={this.handleClick}
        style={{
          cursor: 'pointer',
          backgroundColor: this.props.selected ? '#ddd' : '#fff'
        }}
      />
    );
  }

  private handleClick = () => {
    this.props.onClick(this.props.token);
  }
}
