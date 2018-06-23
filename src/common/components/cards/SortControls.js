import * as React from 'react';
import { func, number } from 'prop-types';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import { capitalize } from 'lodash';

export default class SortControls extends React.Component {
  static propTypes = {
    criteria: number,
    order: number,

    /* eslint-disable react/no-unused-prop-types */
    onSetCriteria: func,
    onSetOrder: func
    /* eslint-enable react/no-unused-prop-types */
  };

  shouldComponentUpdate(newProps) {
    return (newProps.criteria !== this.props.criteria) || (newProps.order !== this.props.order);
  }

  handleSetField = (field) => (e, i, value) => {
    this.props[`onSet${capitalize(field)}`](value);
  }

  renderSelectField(field, items, margin) {
    return (
      <SelectField
        style={{width: '100%', marginRight: margin}}
        value={this.props[field]}
        floatingLabelText={capitalize(field)}
        onChange={this.handleSetField(field)}>
        {items.map((item, idx) => (
          <MenuItem key={idx} value={idx} primaryText={item}/>
        ))}
      </SelectField>
    );
  }

  render() {
    const criteria = ['By Cost', 'By Name', 'By Type', 'By Creator', 'By Attack', 'By Health', 'By Speed'];

    return (
      <div style={{marginBottom: 20}}>
        <div style={{
          fontWeight: 700,
          fontSize: 14
        }}>Sorting</div>

        <div style={{display: 'flex'}}>
          {this.renderSelectField('criteria', criteria, 10)}
          {this.renderSelectField('order', ['Ascending', 'Descending'], 0)}
        </div>
      </div>
    );
  }
}
