import * as React from 'react';
import { bool, func, string } from 'prop-types';
import { ListItem } from 'material-ui/List';

export default class DictionaryTerm extends React.Component {
  static propTypes = {
    token: string,
    selected: bool,
    onClick: func
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.token !== this.props.token || nextProps.selected !== this.props.selected;
  }

  handleClick = () => {
    this.props.onClick(this.props.token);
  };

  render() {
    return (
      <ListItem
        primaryText={this.props.token}
        onClick={this.handleClick}
        style={{
          cursor: 'pointer',
          backgroundColor: this.props.selected ? '#ddd' : '#fff'
        }} />
    );
  }
}
