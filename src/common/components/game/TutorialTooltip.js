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
        width: 330,
        border: '1px solid black',
        padding: 10,
        background: '#D8D8D8'
      },
      percent: {
        position: 'absolute',
        top: 5,
        right: 5,
        fontSize: 10,
        color: '#666'
      },
      leftButton: {
        width: 100
      },
      rightButton: {
        width: 100,
        float: 'right'
      }
    };
  }

  get step() {
    return this.props.tutorialStep;
  }

  get pctComplete() {
    return Math.round((this.step.idx + 1) / this.step.numSteps * 100);
  }

  render() {
    return (
      <Popover
        isOpen
        style={this.styles.container}
        body={
          <div style={this.styles.tooltip}>
            <div style={this.styles.percent}>
              {this.pctComplete}% complete
            </div>

            <p>{this.step.tooltip.text}</p>

            <RaisedButton
              label="PREV"
              disabled={this.step.idx === 0}
              style={this.styles.leftButton}
              onClick={this.props.onPrevStep} />
            <RaisedButton
              label="NEXT"
              disabled={this.pctComplete === 100}
              style={this.styles.rightButton}
              onClick={this.props.onNextStep} />
          </div>
        }
      >
        {this.props.children}
      </Popover>
    );
  }
}
