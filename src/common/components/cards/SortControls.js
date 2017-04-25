import React, { Component } from 'react';
import { func, number } from 'prop-types';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import { capitalize } from 'lodash';

export default class SortControls extends Component {
  static propTypes = {
    criteria: number,
    order: number,

    onSetCriteria: func,
    onSetOrder: func
  };

  shouldComponentUpdate(newProps) {
    return (newProps.criteria !== this.props.criteria) || (newProps.order !== this.props.order);
  }

  renderSelectField(field, items, width) {
    return (
      <SelectField
        style={{width: width}}
        value={this.props[field]}
        floatingLabelText={capitalize(field)}
        onChange={(e, i, value) => { this.props[`onSet${capitalize(field)}`](value); }}>
        {items.map((item, idx) => (
          <MenuItem key={idx} value={idx} primaryText={item}/>
        ))}
      </SelectField>
    );
  }

  render() {
    const criteria = ['Cost', 'Name', 'Type', 'Creator', 'Attack', 'Health', 'Speed'];

    return (
      <div style={{marginBottom: 20}}>
        <div style={{
          fontWeight: 700,
          fontSize: 14
        }}>Sorting</div>

        {this.renderSelectField('criteria', criteria, '45%')}
        {this.renderSelectField('order', ['Ascending', 'Descending'], '55%')}
      </div>
    );
  }
}
