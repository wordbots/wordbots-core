import * as React from 'react';
import Toggle from 'material-ui/Toggle';
import { Range } from 'rc-slider';

import { FilterKey } from './types';

interface FilterControlsProps {
  onToggleFilter: (filter: FilterKey) => (event: React.SyntheticEvent<any>, toggled: boolean) => void
  onSetCostRange: (values: [number, number]) => void
}

export default class FilterControls extends React.Component<FilterControlsProps> {
  public shouldComponentUpdate(): boolean {
    return false;
  }

  public render(): JSX.Element {
    const toggleStyle = { marginBottom: 10 };

    return (
      <div>
        <div key="type" style={{marginBottom: 20}}>
          <div style={{
            fontWeight: 700,
            fontSize: 14,
            marginBottom: 10
          }}>Filter by Card Type</div>

          <Toggle
            style={toggleStyle}
            label="Robots"
            defaultToggled
            onToggle={this.props.onToggleFilter('robots')} />
          <Toggle
            style={toggleStyle}
            label="Events"
            defaultToggled
            onToggle={this.props.onToggleFilter('events')} />
          <Toggle
            style={toggleStyle}
            label="Structures"
            defaultToggled
            onToggle={this.props.onToggleFilter('structures')} />
        </div>

        <div key="cost" style={{marginBottom: 20}}>
          <div style={{
            fontWeight: 700,
            fontSize: 14,
            marginBottom: 20
          }}>Filter by Cost</div>

          <div>
            <Range
              step={1}
              allowCross={false}
              min={0}
              max={20}
              marks={{
                0: '0',
                5: '5',
                10: '10',
                15: '15',
                20: '20'
              }}
              defaultValue={[0, 20]}
              onChange={this.handleChangeCostRange}
            />
          </div>
        </div>
      </div>
    );
  }

  private handleChangeCostRange = (values: [number, number]) => {
    this.props.onSetCostRange(values);
  }
}
