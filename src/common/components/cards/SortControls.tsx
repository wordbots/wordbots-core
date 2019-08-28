import { capitalize } from 'lodash';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import * as React from 'react';

import { SortCriteria, SortOrder } from './types.enums';

interface SortControlsProps {
  criteria: SortCriteria
  order: SortOrder
  onSetCriteria: (criteria: SortCriteria) => void
  onSetOrder: (order: SortOrder) => void
}

export default class SortControls extends React.Component<SortControlsProps> {
  public shouldComponentUpdate(newProps: SortControlsProps): boolean {
    return (newProps.criteria !== this.props.criteria) || (newProps.order !== this.props.order);
  }

  public render(): JSX.Element {
    const criteria = ['By Timestamp', 'By Cost', 'By Name', 'By Type', 'By Attack', 'By Health', 'By Speed'];
    const orders = this.props.criteria === SortCriteria.Timestamp ? ['New → Old', 'Old → New'] : ['Ascending', 'Descending'];

    return (
      <div style={{ marginBottom: 10 }}>
        <div
          style={{
            marginBottom: 5,
            fontWeight: 700,
            fontSize: 14
          }}
        >
          Sorting
        </div>

        {this.renderSelectField('criteria', criteria)}
        {this.renderSelectField('order', orders)}
      </div>
    );
  }

  private renderSelectField(field: 'criteria' | 'order', items: string[]): JSX.Element {
    return (
      <SelectField
        style={{ display: 'block', width: '100%' }}
        value={this.props[field]}
        onChange={this.handleSetField(field)}
      >
        {items.map((item, idx) => (
          <MenuItem key={idx} value={idx} primaryText={item}/>
        ))}
      </SelectField>
    );
  }

  private handleSetField = (field: 'criteria' | 'order') => (_e: React.SyntheticEvent<any>, _i: number, value: number) => {
    const setter = this.props[`onSet${capitalize(field)}` as 'onSetCriteria' | 'onSetOrder'] as (value: number) => void;
    setter(value);
  }
}
