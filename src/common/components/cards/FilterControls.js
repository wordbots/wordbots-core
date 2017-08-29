import React, {Component} from 'react';
import {func} from 'prop-types';
import Toggle from 'material-ui/Toggle';
import {Range} from 'rc-slider';

export default class FilterControls extends Component {
  static propTypes = {
    onToggleFilter: func,
    onSetCostRange: func
  };

  shouldComponentUpdate () {
    return false;
  }

  render () {
    const toggleStyle = {marginBottom: 10};

    return (
      <div>
        <div key="type" style={{marginBottom: 20}}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 14,
              marginBottom: 10
            }}
          >
            Filter by Card Type
          </div>

          <Toggle
            style={toggleStyle}
            label="Robots"
            defaultToggled
            onToggle={this.props.onToggleFilter('robots')}
          />
          <Toggle
            style={toggleStyle}
            label="Events"
            defaultToggled
            onToggle={this.props.onToggleFilter('events')}
          />
          <Toggle
            style={toggleStyle}
            label="Structures"
            defaultToggled
            onToggle={this.props.onToggleFilter('structures')}
          />
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
                0: 0,
                5: 5,
                10: 10,
                15: 15,
                20: 20
              }}
              defaultValue={[ 0, 20 ]}
              onChange={values => {
                this.props.onSetCostRange(values);
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}
