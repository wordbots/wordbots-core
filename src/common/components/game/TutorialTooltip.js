import React, { Component } from 'react';
import { array, bool, func, object, oneOfType } from 'prop-types';
import Popover from 'react-popover';
import RaisedButton from 'material-ui/RaisedButton';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';

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
      text: {
        marginTop: 20,
        marginBottom: 10
      },
      backButton: {
        width: 32,
        height: 32,
        padding: 0
      },
      nextButton: {
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

  get backButton() {
    if (this.step.idx > 0) {
      return (
        <IconButton onClick={this.props.onPrevStep} style={this.styles.backButton}>
          <FontIcon className="material-icons" color="#666">replay</FontIcon>
        </IconButton>
      );
    }
  }

  get nextButton() {
    if (!this.step.action) {
      return (
        <RaisedButton
          label={this.pctComplete === 100 ? 'FINISH' : 'NEXT'}
          style={this.styles.nextButton}
          onClick={this.props.onNextStep}
        />
      );
    }
  }

  get tooltipBody() {
    return (
      <div style={this.styles.tooltip}>
        <div style={this.styles.percent}>
          {this.pctComplete}% complete
        </div>

        <div style={this.styles.text}>
          {this.step.tooltip.text}
        </div>

        {this.backButton}
        {this.nextButton}
      </div>
    );
  }

  render() {
    if (this.step && this.props.enabled) {
      return (
        <Popover
          isOpen
          style={this.styles.container}
          tipSize={15}
          body={this.tooltipBody}
        >
          {this.props.children}
        </Popover>
      );
    } else {
      return this.props.children;
    }
  }
}
