import * as React from 'react';

import { MAX_Z_INDEX } from '../../constants';
import * as w from '../../types';
import Popover from '../Popover';

import ActivatedAbility from './ActivatedAbility';

interface AbilitiesTooltipProps {
  children: JSX.Element | JSX.Element[]
  activatedAbilities: w.ActivatedAbility[]
  onActivateAbility: (idx: number) => void
}

export default class AbilitiesTooltip extends React.Component<AbilitiesTooltipProps> {
  get styles(): Record<string, React.CSSProperties> {
    return {
      container: {
        zIndex: MAX_Z_INDEX
      },
      tooltip: {
        width: 330,
        borderRadius: '3px',
        padding: 10,
        background: 'white',
        boxShadow: 'rgba(0, 0, 0, 0.19) 0px 10px 30px, rgba(0, 0, 0, 0.23) 0px 6px 10px'
      }
    };
  }

  get tooltipBody(): JSX.Element {
    return (
      <div style={this.styles.tooltip}>
        {
          this.props.activatedAbilities.map((ability, idx) =>
            <ActivatedAbility
              key={idx}
              idx={idx}
              marginBottom={idx === this.props.activatedAbilities.length - 1 ? 0 : 10}
              text={ability.text}
              onActivateAbility={this.props.onActivateAbility}
            />
          )
        }
      </div>
    );
  }

  public render(): JSX.Element {
    return (
      <Popover
        style={this.styles.container}
        body={this.tooltipBody}
        preferPlace="right"
      >
        {this.props.children}
      </Popover>
    );
  }
}
