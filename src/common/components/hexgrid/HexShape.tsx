import * as React from 'react';

import { DISPLAY_HEX_IDS, SHOW_TOOLTIP_TIMEOUT_MS } from '../../constants';
import * as w from '../../types';
import CardTooltip from '../card/CardTooltip';
import AbilitiesTooltip from '../game/AbilitiesTooltip';
import TutorialTooltip from '../game/TutorialTooltip';

import FillPattern from './FillPattern';
import Hex from './Hex';
import HexUtils from './HexUtils';
import Layout from './Layout';
import { Actions } from './types';

interface HexShapeProps {
  hex: Hex
  layout: Layout
  actions: Actions

  fill?: string
  card?: w.CardInGame
  tutorialStep?: w.TutorialStep
  activatedAbilities?: w.ActivatedAbility[]
  selected?: boolean
  hovered?: boolean
  isGameOver?: boolean
}

interface HexShapeState {
  displayTooltip: boolean
  tooltipTimeout: NodeJS.Timeout | null
}

export default class HexShape extends React.Component<HexShapeProps, HexShapeState> {
  public state = {
    displayTooltip: false,
    tooltipTimeout: null
  };

  get points(): string {
    const points = this.props.layout.getPolygonPoints(this.props.hex);
    return points.map((point) => `${point.x},${point.y}`).join(' ');
  }

  get translate(): string {
    const { hex, layout } = this.props;
    const pixel = HexUtils.hexToPixel(hex, layout);
    return `translate(${pixel.x}, ${pixel.y})`;
  }

  get hexStyles(): React.CSSProperties {
    const { hex, selected } = this.props;

    if (selected) {
      return {
        stroke: '#666',
        strokeWidth: 0.6,
        fillOpacity: 0
      };
    } else {
      return {
        fill: `url(#${HexUtils.getID(hex)})`
      };
    }
  }

  get shouldRenderTutorialTooltip(): boolean {
    return !!this.props.tutorialStep && (HexUtils.getID(this.props.hex) === this.props.tutorialStep.tooltip.hex);
  }

  public UNSAFE_componentWillReceiveProps(nextProps: HexShapeProps): void {
    if (this.props.hovered !== nextProps.hovered) {
      if (nextProps.hovered) {
        this.triggerTooltip();
      } else {
        this.untriggerTooltip();
      }
    }
  }

  public componentWillUnmount(): void {
    this.untriggerTooltip();
  }

  public render(): JSX.Element {
    const { actions, activatedAbilities, card, isGameOver, tutorialStep } = this.props;
    const { displayTooltip } = this.state;

    if (this.shouldRenderTutorialTooltip) {
      return (
        <TutorialTooltip
          tutorialStep={tutorialStep}
          onNextStep={this.handleClickNextTutorialStep}
          onPrevStep={this.handleClickPrevTutorialStep}
          onEndTutorial={actions.onEndGame}
          place={tutorialStep && tutorialStep.tooltip.place || 'above'}
        >
          {this.renderHex()}
        </TutorialTooltip>
      );
    } else if (isGameOver) {
      return this.renderHex();
    } else if ((activatedAbilities || []).length > 0) {
      return (
        <AbilitiesTooltip
          activatedAbilities={activatedAbilities}
          onActivateAbility={actions.onActivateAbility}
        >
          {this.renderHex()}
        </AbilitiesTooltip>
      );
    } else if (card) {
     return (
        <CardTooltip popover card={card} isOpen={displayTooltip}>
          {this.renderHex()}
        </CardTooltip>
      );
    } else {
      return this.renderHex();
    }
  }

  private handleMouseEnter = (evt: React.MouseEvent<any>) => this.props.actions.onHexHover(this.props.hex, evt);
  private handleMouseLeave = (evt: React.MouseEvent<any>) => this.props.actions.onHexHover(this.props.hex, evt);
  private handleClickHex = (evt: React.MouseEvent<any>) => this.props.actions.onClick(this.props.hex, evt);
  private handleClickNextTutorialStep = () => { this.props.actions.onTutorialStep(false); };
  private handleClickPrevTutorialStep = () => { this.props.actions.onTutorialStep(true); };

  private triggerTooltip = () => {
    this.setState({
      tooltipTimeout: setTimeout(() => {
        this.setState({displayTooltip: true});
      }, SHOW_TOOLTIP_TIMEOUT_MS)
    });
  }

  private untriggerTooltip = () => {
    this.setState((state) => {
      const { tooltipTimeout } = state;
      if (tooltipTimeout !== null) {
        clearTimeout(tooltipTimeout);
      }

      return {
        displayTooltip: false,
        tooltipTimeout: null
      };
    });
  }

  private renderPattern(): JSX.Element | null {
    const { hex, fill, selected } = this.props;
    return selected ? null : <FillPattern hex={hex} fill={fill} />;
  }

  private renderText(): JSX.Element | null {
    if (DISPLAY_HEX_IDS) {
      return <text x="0" y="0.3em" textAnchor="middle">{HexUtils.getID(this.props.hex) || ''}</text>;
    } else {
      return null;
    }
  }

  private renderHex(): JSX.Element {
    return (
      <g
        transform={this.translate}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        onClick={this.handleClickHex}
      >
        {this.renderPattern()}
        <polygon key="p1" points={this.points} style={this.hexStyles} />
        {this.renderText()}
      </g>
    );
  }
}
