import * as React from 'react';
import { object } from 'prop-types';
import Textfit from 'react-textfit';
import Divider from 'material-ui/Divider';
import { CardHeader, CardText } from 'material-ui/Card';
import Paper from '@material-ui/core/Paper';
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { isEqual, noop } from 'lodash';

import * as w from '../../types';
import { TYPE_ROBOT, TYPE_CORE, TYPE_EVENT, TYPE_STRUCTURE, typeToString } from '../../constants';
import { compareCertainKeys } from '../../util/common';
import { inBrowser } from '../../util/browser';

import CardBack from './CardBack';
import CardCostBadge from './CardCostBadge';
import CardImage from './CardImage';
import CardStat from './CardStat';
import Sentence from './Sentence';

interface CardProps {
  children?: string | JSX.Element[]

  id: string
  name: string
  spriteID?: string
  spriteV?: number
  type: w.CardType
  text: string | Array<JSX.Element | null>
  rawText: string
  parseResults?: string
  img?: string
  cardStats: Partial<Record<w.Attribute, number | undefined>>
  stats: Partial<Record<w.Attribute, number | undefined>>
  cost: number
  baseCost: number
  source?: string
  collection?: boolean

  status?: {
    message: string
    type: 'text' | 'error' | ''
  }
  visible?: boolean
  selected?: boolean
  targetable?: boolean

  scale?: number
  margin?: number
  rotation?: number
  yTranslation?: number
  zIndex?: number

  onCardClick?: (id: string) => void
  onCardHover?: (enterOrLeave: boolean) => void
  onSpriteClick?: () => void
}

interface CardState {
  shadow: number
}

export default class Card extends React.Component<CardProps, CardState> {
  // TODO remove this once all sub-components of Card are type-checked
  public static defaultProps = {
    stats: {},
    parseResults: '',
    spriteV: 1,

    visible: true,
    selected: false,

    scale: 1,
    margin: 0,
    rotation: 0,
    yTranslation: 0,
    zIndex: 0,

    onCardClick: noop,
    onCardHover: noop,
    onSpriteClick: noop
  };

  // (For server-side rendering via /api/card.png)
  public static childContextTypes = {
    muiTheme: object.isRequired
  };

  public static fromObj = (card: w.CardInStore, props = {}) => (
    <Card
      id={card.id}
      name={card.name}
      spriteID={card.spriteID}
      spriteV={card.spriteV}
      img={card.img}
      type={card.type}
      text={Sentence.fromText(card.text)}
      rawText={card.text || ''}
      stats={card.stats || {}}
      cardStats={card.stats || {}}
      cost={card.cost}
      baseCost={card.cost}
      source={card.source}
      parseResults=""
      {...props} />
  )

  public state = {
    shadow: 2
  };

  // (For server-side rendering via /api/card.png)
  public getChildContext = () => ({muiTheme: getMuiTheme(baseTheme)});

  public shouldComponentUpdate(nextProps: CardProps, nextState: CardState): boolean {
    const trackedProps = [
      'name', 'spriteID', 'type', 'rawText', 'parseResults',
      'cardStats', 'stats', 'image', 'cost', 'baseCost',
      'status', 'visible', 'selected', 'targetable',
      'margin', 'zIndex'
    ];

    return !compareCertainKeys(nextProps, this.props, trackedProps) || !isEqual(nextState, this.state);
  }

  get numChars(): number {
    return this.props.rawText ? this.props.rawText.length : this.props.text.length;
  }

  get textAreaStyle(): React.CSSProperties {
    const baseStyle = {
      height: 106 * (this.props.scale || 1)
    };

    const compactStyle = {
      height: 96 * (this.props.scale || 1),
      marginTop: (inBrowser() ? 0 : 20) * (this.props.scale || 1),
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    };

    if (this.props.type === TYPE_EVENT && this.numChars < 30) {
      return Object.assign(baseStyle, compactStyle);
    } else {
      return baseStyle;
    }
  }

  get textFitStyle(): React.CSSProperties {
    const baseStyle: React.CSSProperties = {
      padding: 6 * (this.props.scale || 1),
      paddingBottom: 0,
      height: (this.props.type !== TYPE_EVENT ? 70 : 96) * (this.props.scale || 1),
      width: '100%',
      boxSizing: 'border-box'
    };

    const compactStyle: React.CSSProperties = {
      paddingBottom: 6 * (this.props.scale || 1),
      height: '50%',
      textAlign: 'center'
    };

    if (this.props.type === TYPE_EVENT && this.numChars < 30) {
      return {...baseStyle, ...compactStyle};
    } else {
      return baseStyle;
    }
  }

  public render(): JSX.Element {
    const redShadow = 'rgba(255, 35, 35, 0.95)';
    const greenShadow = 'rgba(27, 134, 27, 0.95)';
    const selectedStyle = {
      boxShadow: `${(this.props.status && this.props.status.type === 'error') || this.props.collection ? redShadow : greenShadow  } 0px 0px 20px 5px`
    };
    const transform = `rotate(${this.props.rotation}deg) translate(0px, ${this.props.yTranslation}px)`;

    if (!this.props.visible) {
      return (
        <div style={{
          padding: '24px 0 12px 0',
          marginRight: this.props.margin,
          transform
        }}>
          <CardBack />
        </div>
      );
    } else {
      return (
        <div>
          <CardCostBadge
            cost={this.props.cost}
            baseCost={this.props.baseCost}
            scale={this.props.scale}
            margin={this.props.margin}
            zIndex={this.props.zIndex}
            transform={transform}
          >
            <div
              onClick={this.handleClick}
              onMouseEnter={this.handleMouseEnter}
              onMouseLeave={this.handleMouseLeave}
            >
              <Paper
                elevation={this.state.shadow}
                style={Object.assign({
                  width: 140 * (this.props.scale || 1),
                  height: 211 * (this.props.scale || 1),
                  marginRight: 10 * (this.props.scale || 1),
                  borderRadius: 5 * (this.props.scale || 1),
                  userSelect: 'none',
                  cursor: 'pointer',
                  border: this.props.source === 'builtin' ? '3px solid #888' : '3px solid #f44336',
                  position: 'relative'
                }, (this.props.selected || this.props.targetable ? selectedStyle : {})) as React.CSSProperties}
              >
                <CardHeader
                  style={{padding: 8 * (this.props.scale || 1), height: 'auto'}}
                  title={this.renderTitle()}
                  titleStyle={{fontSize: 15 * (this.props.scale || 1)}}
                  subtitle={typeToString(this.props.type)}
                  subtitleStyle={{fontSize: 14 * (this.props.scale || 1)}} />

                <Divider/>

                <CardImage
                  type={this.props.type}
                  spriteID={this.props.spriteID || this.props.name}
                  spriteV={this.props.spriteV}
                  img={this.props.img}
                  source={this.props.source}
                  scale={this.props.scale}
                  onSpriteClick={this.props.onSpriteClick} />

                <Divider/>

                <div style={this.textAreaStyle}>
                  {this.renderText()}
                  {this.renderStatsArea()}
                </div>
              </Paper>
            </div>
          </CardCostBadge>
        </div>
      );
    }
  }

  private handleClick = () => {
    if (this.props.onCardClick) {
      this.props.onCardClick(this.props.id);
    }
  }

  private handleMouseEnter = () => {
    this.setState({ shadow: 3 });
    if (this.props.onCardHover) {
      this.props.onCardHover(true);
    }
  }

  private handleMouseLeave = () => {
    this.setState({ shadow: 2 });
    if (this.props.onCardHover) {
      this.props.onCardHover(false);
    }
  }

  private renderTitle(): JSX.Element {
    if (!inBrowser()) {
      // Textfit won't work without a DOM, so just estimate something reasonable.
      const maxFontSize = Math.round(180 / this.props.name.length);
      return (
        <div style={{
          width: 105 * (this.props.scale || 1),
          height: 20 * (this.props.scale || 1),
          fontSize: Math.min(maxFontSize, 16) * (this.props.scale || 1)
        }}>
          {this.props.name}
        </div>
      );
    } else {
      return (
        <Textfit
          mode="multi"
          autoResize={false}
          max={16 * (this.props.scale || 1)}
          style={{
            width: 105 * (this.props.scale || 1),
            height: 23 * (this.props.scale || 1)
        }}>
          {this.props.name}
        </Textfit>
      );
    }
  }

  private renderText(): JSX.Element {
    if (!inBrowser()) {
      // Textfit won't work without a DOM, so just estimate something reasonable.
      const maxFontSize = Math.round((this.props.type !== TYPE_EVENT ? 90 : 105) / Math.sqrt(this.numChars));
      return (
        <div style={Object.assign(this.textFitStyle, {
          fontSize: Math.min(maxFontSize, 14)
        })}>
          {this.props.text}
        </div>
      );
    } else {
      return (
        <Textfit
          autoResize={false}
          mode="multi"
          max={14 * (this.props.scale || 1)}
          style={this.textFitStyle}
        >
          {this.props.text}
        </Textfit>
      );
    }
  }

  private renderStat(type: w.Attribute): JSX.Element {
    return (
      <CardStat type={type} base={this.props.cardStats[type]} current={this.props.stats[type]} scale={this.props.scale}/>
    );
  }

  private renderStatsArea(): JSX.Element | undefined {
    const style: React.CSSProperties = {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      padding: 0
    };

    if (this.props.type === TYPE_ROBOT) {
      return (
        <CardText style={style}>
          {this.renderStat('attack')}
          {this.renderStat('health')}
          {this.renderStat('speed')}
        </CardText>
      );
    } else if (this.props.type === TYPE_CORE || this.props.type === TYPE_STRUCTURE) {
      return (
        <CardText style={Object.assign(style, {marginLeft: '31%'})}>
          {this.renderStat('health')}
        </CardText>
      );
    }
  }
}
