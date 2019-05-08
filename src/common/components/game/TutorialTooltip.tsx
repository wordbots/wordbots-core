import { noop } from 'lodash';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';
import * as React from 'react';
import * as ReactPopover from 'react-popover';

import { TUTORIAL_Z_INDEX } from '../../constants';
import * as w from '../../types';
import Popover from '../Popover';
import Tooltip from '../Tooltip';

interface TutorialTooltipProps {
  children: JSX.Element | JSX.Element[]
  tutorialStep?: w.TutorialStep
  place?: ReactPopover.PopoverPlace
  enabled?: boolean
  top?: number
  left?: number

  onNextStep: () => void
  onPrevStep: () => void
  onEndTutorial?: () => void
}

interface TutorialTooltipState {
  hidden: boolean
}

export default class TutorialTooltip extends React.Component<TutorialTooltipProps, TutorialTooltipState> {
  public state = {
    hidden: false
  };

  get styles(): Record<string, React.CSSProperties> {
    return {
      container: {
        zIndex: TUTORIAL_Z_INDEX,
        marginTop: this.props.top || 15,
        marginLeft: this.props.left || 0
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

  get step(): w.TutorialStep | undefined {
    return this.props.tutorialStep;
  }

  get isOnlyStep(): boolean {
    return !!this.step && this.step.numSteps === 1;
  }

  get pctComplete(): number {
    return this.step ? Math.round((this.step.idx + 1) / this.step.numSteps * 100) : 0;
  }

  get isComplete(): boolean {
    return this.pctComplete === 100;
  }

  get backButton(): JSX.Element | null {
    return this.step ? (
      <Tooltip inline text="Go back a step">
        <IconButton
          onClick={this.props.onPrevStep}
          disabled={this.step.idx === 0}
          style={this.styles.backButton}
        >
          <FontIcon className="material-icons" color="#666" style={{width: 5, height: 5}}>arrow_back</FontIcon>
        </IconButton>
      </Tooltip>
    ) : null;
  }

  get nextButton(): JSX.Element | null {
    if (!this.step || this.step.action) {
      return null;  // Only display the Next button if there is no other action to perform.
    } else {
      return (
        <RaisedButton
          label={this.isComplete ? 'FINISH' : 'NEXT'}
          style={this.styles.nextButton}
          onClick={this.isComplete ? (this.props.onEndTutorial || noop) : this.props.onNextStep}
        />
      );
    }
  }

  get hideButton(): JSX.Element {
    return (
      <RaisedButton
        label="CLOSE"
        style={this.styles.nextButton}
        onClick={this.hide}
      />
    );
  }

  get tooltipBody(): JSX.Element | null {
    return this.step ? (
      <div style={this.styles.tooltip}>
        {!this.isOnlyStep && <div style={this.styles.percent}>
          {this.pctComplete}% complete
        </div>}

        <div>
          {this.step.tooltip.text.split('\n').map((text, i) => <p key={i}>{text}</p>)}
        </div>

        {this.step.tooltip.backButton || this.backButton}
        {this.isOnlyStep ? this.hideButton : this.nextButton}
      </div>
    ) : null;
  }

  public render(): JSX.Element | JSX.Element[] {
    const enabled = this.props.enabled === undefined ? true : this.props.enabled;
    if (this.step && enabled && !this.state.hidden) {
      return (
        <Popover
          body={this.tooltipBody!}
          style={this.styles.container}
          place={this.props.place}
        >
          {this.props.children}
        </Popover>
      );
    } else {
      return this.props.children;
    }
  }

  private hide = () => {
    this.setState({ hidden: true });
  }
}
