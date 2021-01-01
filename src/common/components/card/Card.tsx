import Paper from '@material-ui/core/Paper';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Divider from '@material-ui/core/Divider';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import { isEqual, noop } from 'lodash';
import { object } from 'prop-types';
import * as React from 'react';
import Textfit from 'react-textfit';

import { TYPE_CORE, TYPE_EVENT, TYPE_ROBOT, TYPE_STRUCTURE, typeToString } from '../../constants';
import { isCardVisible } from '../../guards';
import * as w from '../../types';
import { inBrowser } from '../../util/browser';
import { compareCertainKeys } from '../../util/common';

import CardBack from './CardBack';
import CardCostBadge from './CardCostBadge';
import CardImage from './CardImage';
import CardStat from './CardStat';
import Sentence from './Sentence';

export interface CardProps {
  children?: string | JSX.Element[]

  id?: string
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
  baseCost?: number
  source: w.CardSource
  collection?: boolean

  visible: boolean
  status?: {
    message: string
    type: 'text' | 'error' | ''
  }
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

export class Card extends React.Component<CardProps & WithStyles, CardState> {
  // (For server-side rendering via /api/card.png)
  public static childContextTypes = {
    muiTheme: object.isRequired
  };

  public static styles: Record<string, CSSProperties> = {
    headerTitle: {
      lineHeight: '1em',
      marginTop: -2,
      marginBottom: 2
    },
    headerSubtitle: {
      lineHeight: '1em'
    }
  }

  public static fromObj = (card: w.PossiblyObfuscatedCard, props: Partial<CardProps> = {}) => (
    isCardVisible(card)
      ? (
      <CardWithStyles
        visible
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
        source={card.metadata.source}
        parseResults=""
        {...props}
      />
      ) : <CardBack />
  )

  public state = {
    shadow: 2
  };

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
    const { text, rawText } = this.props;
    return rawText ? rawText.length : text.length;
  }

  get textAreaStyle(): React.CSSProperties {
    const { scale, type } = this.props;
    const baseStyle = {
      height: 106 * (scale || 1)
    };

    const compactStyle = {
      height: 96 * (scale || 1),
      marginTop: (inBrowser() ? 0 : 20) * (scale || 1),
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    };

    if (type === TYPE_EVENT && this.numChars < 30) {
      return {...baseStyle, ...compactStyle};
    } else {
      return baseStyle;
    }
  }

  get textFitStyle(): React.CSSProperties {
    const { type, scale } = this.props;
    const baseStyle: React.CSSProperties = {
      padding: 6 * (scale || 1),
      paddingBottom: 0,
      height: (type !== TYPE_EVENT ? 70 : 96) * (scale || 1),
      width: '100%',
      boxSizing: 'border-box'
    };

    const compactStyle: React.CSSProperties = {
      paddingBottom: 6 * (scale || 1),
      height: '50%',
      textAlign: 'center'
    };

    if (type === TYPE_EVENT && this.numChars < 30) {
      return {...baseStyle, ...compactStyle};
    } else {
      return baseStyle;
    }
  }

  public render(): JSX.Element {
    const {
      name, spriteID, spriteV, type, img, cost, baseCost, source, collection,
      status, visible, selected, targetable,
      scale, margin, rotation, yTranslation,
      onSpriteClick, classes
    } = this.props;
    const redShadow = 'rgba(255, 35, 35, 0.45)';
    const greenShadow = 'rgba(27, 134, 27, 0.95)';
    const selectedStyle = {
      boxShadow: `${(status && status.type === 'error') || collection ? redShadow : greenShadow  } 0px 0px 20px 5px`
    };
    const transform = `rotate(${rotation || 0}deg) translate(0px, ${yTranslation || 0}px)`;

    if (!visible) {
      return (
        <div
          style={{
            padding: '24px 0 12px 0',
            marginRight: margin,
            transform
          }}
        >
          <CardBack />
        </div>
      );
    } else {
      return (
        <div
          style={{
            padding: '24px 0 12px 0',
            marginRight: margin,
            transform
          }}
        >
          <CardCostBadge
            cost={cost}
            baseCost={baseCost || cost}
            scale={scale || 1}
          >
            <div
              onClick={this.handleClick}
              onMouseEnter={this.handleMouseEnter}
              onMouseLeave={this.handleMouseLeave}
            >
              <Paper
                elevation={this.state.shadow}
                style={{
                  width: 140 * (scale || 1),
                  height: 211 * (scale || 1),
                  marginRight: 10 * (scale || 1),
                  borderRadius: 5 * (scale || 1),
                  userSelect: 'none',
                  cursor: 'pointer',
                  border: source?.type === 'builtin' ? '3px solid #888' : '3px solid #f44336',
                  position: 'relative',
                  ...(selected || targetable ? selectedStyle : {})
                } as React.CSSProperties}
              >
                <CardHeader
                  style={{padding: 8 * (scale || 1), height: 'auto'}}
                  title={this.renderTitle()}
                  subheader={<span style={{fontSize: 14 * (scale || 1)}}>{typeToString(type)}</span>}
                  classes={{
                    title: classes.headerTitle,
                    subheader: classes.headerSubtitle
                  }}
                />

                <Divider/>

                <CardImage
                  type={type}
                  spriteID={spriteID || name}
                  spriteV={spriteV}
                  img={img}
                  source={source}
                  scale={scale || 1}
                  onSpriteClick={onSpriteClick || noop}
                />

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
    const { id, onCardClick } = this.props;
    if (id && onCardClick) {
      onCardClick(id);
    }
  }

  private handleMouseEnter = () => {
    const { onCardHover } = this.props;
    this.setState({ shadow: 3 });
    if (onCardHover) {
      onCardHover(true);
    }
  }

  private handleMouseLeave = () => {
    const { onCardHover } = this.props;
    this.setState({ shadow: 2 });
    if (onCardHover) {
      onCardHover(false);
    }
  }

  private renderTitle(): JSX.Element {
    const { name, scale } = this.props;

    if (!inBrowser()) {
      // Textfit won't work without a DOM, so just estimate something reasonable.
      const maxFontSize = Math.round(180 / name.length);
      return (
        <div
          style={{
            width: 105 * (scale || 1),
            height: 20 * (scale || 1),
            fontSize: Math.min(maxFontSize, 16) * (scale || 1)
          }}
        >
          {name}
        </div>
      );
    } else {
      return (
        <Textfit
          mode="single"
          autoResize={false}
          min={8 * (scale || 1)}
          max={16 * (scale || 1)}
          style={{
            width: 105 * (scale || 1),
            height: 23 * (scale || 1)
          }}
        >
          {name}
        </Textfit>
      );
    }
  }

  private renderText(): JSX.Element {
    const { type, text, scale } = this.props;

    if (!inBrowser()) {
      // Textfit won't work without a DOM, so just estimate something reasonable.
      const maxFontSize = Math.round((type !== TYPE_EVENT ? 90 : 105) / Math.sqrt(this.numChars));
      return (
        <div
          style={{
            ...this.textFitStyle,
            fontSize: Math.min(maxFontSize, 14)
          }}
        >
          {text}
        </div>
      );
    } else {
      return (
        <Textfit
          autoResize={false}
          mode="multi"
          max={14 * (scale || 1)}
          style={this.textFitStyle}
        >
          {text}
        </Textfit>
      );
    }
  }

  private renderStat(type: w.Attribute): JSX.Element {
    const { cardStats, stats, scale } = this.props;
    return (
      <CardStat type={type} base={(cardStats || {})[type]} current={(stats || {})[type]} scale={scale} />
    );
  }

  private renderStatsArea(): JSX.Element | undefined {
    const { type } = this.props;
    const style: React.CSSProperties = {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      padding: 0
    };

    if (type === TYPE_ROBOT) {
      return (
        <CardContent style={style}>
          {this.renderStat('attack')}
          {this.renderStat('health')}
          {this.renderStat('speed')}
        </CardContent>
      );
    } else if (type === TYPE_CORE || type === TYPE_STRUCTURE) {
      return (
        <CardContent style={{...style, marginLeft: '31%'}}>
          {this.renderStat('health')}
        </CardContent>
      );
    }
  }
}

const CardWithStyles = withStyles(Card.styles)(Card);

export default CardWithStyles;
