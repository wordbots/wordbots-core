import React, { Component } from 'react';
import { arrayOf, bool, func, number, object, oneOfType, string } from 'prop-types';
import Popover from 'react-popover';
import RaisedButton from 'material-ui/RaisedButton';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import { noop } from 'lodash';

import { getGameAreaNode } from '../../util/browser';
import Tooltip from '../Tooltip';

export default class TutorialTooltip extends Component {
  static propTypes = {
    children: oneOfType([arrayOf(object), object]),
    tutorialStep: object,
    enabled: bool,
    top: number,
    left: number,
    place: string,

    onNextStep: func,
    onPrevStep: func,
    onEndTutorial: func
  };

  static defaultProps = {
    enabled: true,
    top: 15,
    left: 0,
    onEndTutorial: noop
  };

  get styles() {
    return {
      container: {
        zIndex: 999999,
        marginTop: this.props.top,
        marginLeft: this.props.left
      },
      tooltip: {
        width: 330,
        borderRadius: '3px',
        padding: 10,
        background: 'white',
        boxShadow: 'rgba(0, 0, 0, 0.19) 0px 10px 30px, rgba(0, 0, 0, 0.23) 0px 6px 10px'
      },
      percent: {
        position: 'absolute',
        top: 8,
        right: this.props.place === 'left' ? 22 : 8,  // For some reason, left-alignment screws up the right edge.
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

  get isComplete() {
    return this.pctComplete === 100;
  }

  get backButton() {
    return (
      <Tooltip inline text="Go back a step">
        <IconButton
          onClick={this.props.onPrevStep}
          disabled={this.step.idx === 0}
          style={this.styles.backButton}
        >
          <FontIcon className="material-icons" color="#666" style={{width: 5, height: 5}}>replay</FontIcon>
        </IconButton>
      </Tooltip>
    );
  }

  get nextButton() {
    if (!this.step.action) {
      return (
        <RaisedButton
          label={this.isComplete ? 'FINISH' : 'NEXT'}
          style={this.styles.nextButton}
          onClick={this.isComplete ? this.props.onEndTutorial : this.props.onNextStep}
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
          refreshIntervalMs={50}
          place={this.props.place}
          appendTarget={getGameAreaNode()}
        >
          {this.props.children}
        </Popover>
      );
    } else {
      return this.props.children;
    }
  }
}
