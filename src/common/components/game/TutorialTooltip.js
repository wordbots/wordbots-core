import React, { Component } from 'react';
import { array, bool, func, object, oneOfType } from 'prop-types';
import Popover from 'react-popover';
import RaisedButton from 'material-ui/RaisedButton';

export default class TutorialTooltip extends Component {
  static propTypes = {
    children: oneOfType([array, object]),
    tutorialStep: object,
    enabled: bool,

    onNextStep: func,
    onPrevStep: func
  };

  static defaultProps = {
    enabled: true
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
        top: 8,
        right: 8,
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

  renderButtons() {
    const backButton = (
      <RaisedButton
        label="BACK"
        disabled={this.step.idx === 0}
        style={this.styles.leftButton}
        onClick={this.props.onPrevStep}
      />
    );
    const nextButton = (
      <RaisedButton
        label={this.pctComplete === 100 ? 'FINISH' : 'NEXT'}
        style={this.styles.rightButton}
        onClick={this.props.onNextStep} />
    );

    return (
      <div>
        {backButton}
        {this.step.action ? null : nextButton}
      </div>
    );
  }

  render() {
    if (this.step && this.props.enabled) {
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

              {this.renderButtons()}
            </div>
          }
        >
          {this.props.children}
        </Popover>
      );
    } else {
      return this.props.children;
    }
  }
}
