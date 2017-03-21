import React, { Component } from 'react';
import SelectField from 'material-ui/lib/SelectField';
import MenuItem from 'material-ui/lib/menus/menu-item';

class SortControls extends Component {
  render() {
    return (
      <div style={{marginBottom: 20}}>
        <div style={{
          fontWeight: 700,
          fontSize: 14
        }}>Sorting</div>

        <SelectField
          style={{width: '100%'}}
          value={this.props.criteria}
          floatingLabelText="Criteria"
          onChange={(e, i, value) => { this.props.onSetCriteria(value); }}>
          <MenuItem value={0} primaryText="By Cost"/>
          <MenuItem value={1} primaryText="By Name"/>
          <MenuItem value={2} primaryText="By Type"/>
          <MenuItem value={3} primaryText="By Creator"/>
        </SelectField>
        <SelectField
          style={{width: '100%'}}
          value={this.props.order}
          floatingLabelText="Order"
          onChange={(e, i, value) => { this.props.onSetOrder(value); }}>
          <MenuItem value={0} primaryText="Ascending"/>
          <MenuItem value={1} primaryText="Descending"/>
        </SelectField>
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

