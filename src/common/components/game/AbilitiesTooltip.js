import * as React from 'react';
import { arrayOf, func, object, oneOfType } from 'prop-types';

import { MAX_Z_INDEX } from '../../constants.ts';
import Popover from '../Popover.tsx';

import ActivatedAbility from './ActivatedAbility';

export default class AbilitiesTooltip extends React.Component {
  static propTypes = {
    children: oneOfType([arrayOf(object), object]),
    activatedAbilities: arrayOf(object),

    onActivateAbility: func
  };

  get styles() {
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

  get tooltipBody() {
    return (
      <div style={this.styles.tooltip}>
        {
          this.props.activatedAbilities.map((ability, idx) =>
            <ActivatedAbility
              key={idx}
              idx={idx}
              marginBottom={idx === this.props.activatedAbilities.length - 1 ? 0 : 10}
              text={ability.text}
              onActivateAbility={this.props.onActivateAbility} />
          )
        }
      </div>
    );
  }

  render() {
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
