import React, {Component} from 'react';
import {func, number} from 'prop-types';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import {capitalize} from 'lodash';

export default class SortControls extends Component {
  static propTypes = {
    criteria: number,
    order: number,

    onSetCriteria: func,
    onSetOrder: func
  };

  shouldComponentUpdate(newProps) {
    return newProps.criteria !== this.props.criteria || newProps.order !== this.props.order;
  }

  renderSelectField(field, items, margin) {
    return (
      <SelectField
        style={{width: '100%', marginRight: margin}}
        value={this.props[field]}
        floatingLabelText={capitalize(field)}
        onChange={(e, i, value) => {
          this.props[`onSet${capitalize(field)}`](value);
        }}
      >
        {items.map((item, idx) => <MenuItem key={idx} value={idx} primaryText={item} />)}
      </SelectField>
    );
  }

  render() {
    const criteria = [
      'By Cost',
      'By Name',
      'By Type',
      'By Creator',
      'By Attack',
      'By Health',
      'By Speed'
    ];

    return (
      <div style={{marginBottom: 20}}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 14
          }}
        >
          Sorting
        </div>

        <div style={{display: 'flex'}}>
          {this.renderSelectField('criteria', criteria, 10)}
          {this.renderSelectField('order', [ 'Ascending', 'Descending' ], 0)}
        </div>
      </div>
    );
  }
}
