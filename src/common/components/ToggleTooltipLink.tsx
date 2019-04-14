import * as React from 'react';

import { toggleFlag } from '../util/browser';

interface ToggleTooltipLinkProps {
  tooltipName: string
}

interface ToggleTooltipLinkState {
  tooltipShouldDisplay: boolean
}

export default class ToggleTooltipLink extends React.Component<ToggleTooltipLinkProps, ToggleTooltipLinkState> {
  public state = {
    tooltipShouldDisplay: true
  };

  public render(): JSX.Element {
    return (
      <span style={{color: '#666', display: 'inline-block', fontSize: 12, margin: '14px 4px 8px'}}>
        <a
          onClick={this.toggleDisplaySandboxTooltip}
          style={{cursor: 'pointer', textDecoration: 'underline'}}
        >
          {this.state.tooltipShouldDisplay ? 'Don\'t show this message again' : 'Keep showing this message'}
        </a>
      </span>
    );
  }

  private toggleDisplaySandboxTooltip = () => {
    toggleFlag(`skipTooltip:${this.props.tooltipName}`);
    this.setState((state) => ({tooltipShouldDisplay: !state.tooltipShouldDisplay}));
  }
}
