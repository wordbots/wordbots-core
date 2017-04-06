import React, { Component } from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import { capitalize } from 'lodash';

class SortControls extends Component {
  renderSelectField(field, items) {
    return (
      <SelectField
        style={{width: '100%'}}
        value={this.props[field]}
        floatingLabelText={capitalize(field)}
        onChange={(e, i, value) => { this.props[`onSet${capitalize(field)}`](value); }}>
        {items.map((item, idx) => (
          <MenuItem value={idx} primaryText={item}/>
        ))}
      </SelectField>
    );
  }

  render() {
    return (
      <div style={{marginBottom: 20}}>
        <div style={{
          fontWeight: 700,
          fontSize: 14
        }}>Sorting</div>

        {this.renderSelectField('criteria', ['By Cost', 'By Name', 'By Type', 'By Creator'])}
        {this.renderSelectField('order', ['Ascending', 'Descending'])}
      </div>
    );
  }
}

const { func, number } = React.PropTypes;

SortControls.propTypes = {
  criteria: number,
  order: number,

  onSetCriteria: func,
  onSetOrder: func
};

export default SortControls;

