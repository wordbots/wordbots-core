import * as React from 'react';
import { string } from 'prop-types';

import { toggleFlag } from '../util/browser';

export default class ToggleTooltipLink extends React.Component {
  static propTypes = {
    tooltipName: string
  };

  state = {
    tooltipShouldDisplay: true
  };

  toggleDisplaySandboxTooltip = () => {
    toggleFlag(`skipTooltip:${this.props.tooltipName}`);
    this.setState(state => ({tooltipShouldDisplay: !state.tooltipShouldDisplay}));
  }

  render() {
    return (
      <span style={{color: '#666', display: 'inline-block', fontSize: 12, margin: '14px 4px 8px'}}>
        <a
          onClick={this.toggleDisplaySandboxTooltip}
          style={{cursor: 'pointer', textDecoration: 'underline'}}
        >{this.state.tooltipShouldDisplay ? 'Don\'t show this message again' : 'Keep showing this message'}</a>
      </span>
    );
  }
}
