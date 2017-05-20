import React, { Component } from 'react';
import { array, func, object, oneOfType } from 'prop-types';
import Popover from 'react-popover';
import RaisedButton from 'material-ui/RaisedButton';

export default class TutorialTooltip extends Component {
  static propTypes = {
    children: oneOfType([array, object]),
    tutorialStep: object,

    onNextStep: func,
    onPrevStep: func
  };

  get styles() {
    return {
      container: {
        zIndex: 99999,
        marginTop: 15
      },
      tooltip: {
        border: '1px solid black',
        padding: 5,
        background: '#CCC'
      }
    };
  }

  get step() {
    return this.props.tutorialStep;
  }

  render() {
    return (
      <Popover
        isOpen
        style={this.styles.container}
        body={
          <div style={this.styles.tooltip}>
            <p>{this.step.idx + 1} / {this.step.numSteps}</p>
            <p>{this.step.tooltip.text}</p>
            <RaisedButton label="<" onClick={this.props.onPrevStep} />
            <RaisedButton label=">" onClick={this.props.onNextStep} />
          </div>
        }
      >
        {this.props.children}
      </Popover>
    );
  }
}
