import { FormControlLabel, FormGroup, Switch } from '@material-ui/core';
import { Range } from 'rc-slider';
import * as React from 'react';

import { FilterKey } from './types';

interface FilterControlsProps {
  onToggleFilter: (filter: FilterKey) => (event: React.ChangeEvent<any>, toggled: boolean) => void
  onSetCostRange: (values: [number, number]) => void
}

export default class FilterControls extends React.Component<FilterControlsProps> {
  public shouldComponentUpdate(): boolean {
    return false;
  }

  public render(): JSX.Element {
    return (
      <div>
        <div key="type" style={{marginBottom: 15}}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 14
            }}
          >
            Filter by Card Type
          </div>

          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  color="primary"
                  defaultChecked
                  onChange={this.props.onToggleFilter('robots')}
                />
              }
              label="Robots"
              labelPlacement="start"
              style={{ justifyContent: 'space-between', marginBottom: -12 }}
            />
            <FormControlLabel
              control={
                <Switch
                  color="primary"
                  defaultChecked
                  onChange={this.props.onToggleFilter('events')}
                />
              }
              label="Actions"
              labelPlacement="start"
              style={{ justifyContent: 'space-between', marginBottom: -12 }}
            />
            <FormControlLabel
              control={
                <Switch
                  color="primary"
                  defaultChecked
                  onChange={this.props.onToggleFilter('structures')}
                />
              }
              label="Structures"
              labelPlacement="start"
              style={{ justifyContent: 'space-between', marginBottom: -12 }}
            />
          </FormGroup>
        </div>

        <div key="cost" style={{marginBottom: 20}}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 14,
              marginBottom: 20
            }}
          >
            Filter by Cost
          </div>

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
