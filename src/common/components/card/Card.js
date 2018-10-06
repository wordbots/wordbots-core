import * as React from 'react';
import { arrayOf, bool, func, number, object, oneOfType, string } from 'prop-types';
import Textfit from 'react-textfit';
import Divider from 'material-ui/Divider';
import { CardHeader, CardText } from 'material-ui/Card';
import Paper from '@material-ui/core/Paper';
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { isEqual, noop } from 'lodash';

import { TYPE_ROBOT, TYPE_CORE, TYPE_EVENT, TYPE_STRUCTURE, typeToString } from '../../constants.ts';
import { compareCertainKeys } from '../../util/common.ts';
import { splitSentences } from '../../util/cards.ts';
import { inBrowser } from '../../util/browser.tsx';

import CardBack from './CardBack';
import CardCostBadge from './CardCostBadge';
import CardImage from './CardImage';
import CardStat from './CardStat';
import Sentence from './Sentence';

export default class Card extends React.Component {
  static propTypes = {
    children: oneOfType([string, arrayOf(object)]),

    id: string,
    name: string,
    spriteID: string,
    spriteV: number,
    type: number,
    text: oneOfType([string, arrayOf(object)]),
    rawText: string,
    parseResults: string,
    img: string,
    cardStats: object,
    stats: object,
    cost: number,
    baseCost: number,
    source: string,
    collection: bool,

    status: object,
    visible: bool,
    selected: bool,
    targetable: bool,

    scale: number,
    margin: number,
    rotation: number,
    yTranslation: number,
    zIndex: number,

    onCardClick: func,
    onCardHover: func,
    onSpriteClick: func
  };

  static defaultProps = {
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
  }

  static fromObj = (card, props = {}) => (
    <Card
        id={card.id}
        name={card.name}
        spriteID={card.spriteID}
        spriteV={card.spriteV}
        img={card.img}
        type={card.type}
        text={splitSentences(card.text).map(Sentence)}
        rawText={card.text || ''}
        stats={card.stats}
        cardStats={card.stats}
        cost={card.cost}
        baseCost={card.cost}
        source={card.source}
        {...props} />
  );

  // (For server-side rendering via /api/card.png)
  static childContextTypes = {
    muiTheme: object.isRequired
  };
  getChildContext = () => ({muiTheme: getMuiTheme(baseTheme)})

  state = {
    shadow: 2
  };

  shouldComponentUpdate(nextProps, nextState) {
    const trackedProps = [
      'name', 'spriteID', 'type', 'rawText', 'parseResults',
      'cardStats', 'stats', 'image', 'cost', 'baseCost',
      'status', 'visible', 'selected', 'targetable',
      'margin', 'zIndex'
    ];

    return !compareCertainKeys(nextProps, this.props, trackedProps) || !isEqual(nextState, this.state);
  }

  handleClick = () => {
    this.props.onCardClick(this.props.id);
  }

  handleMouseEnter = () => {
    this.setState({ shadow: 3 });
    this.props.onCardHover(true);
  }

  handleMouseLeave = () => {
    this.setState({ shadow: 2 });
    this.props.onCardHover(false);
  }

  get numChars() {
    return this.props.rawText ? this.props.rawText.length : this.props.text.length;
  }

  get textAreaStyle() {
    const baseStyle = {
      height: 106 * this.props.scale
    };

    const compactStyle = {
      height: 96 * this.props.scale,
      marginTop: (inBrowser() ? 0 : 20) * this.props.scale,
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

  get textFitStyle() {
    const baseStyle = {
      padding: 6 * this.props.scale,
      paddingBottom: 0,
      height: (this.props.type !== TYPE_EVENT ? 70 : 96) * this.props.scale,
      width: '100%',
      boxSizing: 'border-box'
    };

    const compactStyle = {
      paddingBottom: 6 * this.props.scale,
      height: '50%',
      textAlign: 'center'
    };

    if (this.props.type === TYPE_EVENT && this.numChars < 30) {
      return Object.assign(baseStyle, compactStyle);
    } else {
      return baseStyle;
    }
  }

  renderTitle() {
    if (!inBrowser()) {
      // Textfit won't work without a DOM, so just estimate something reasonable.
      const maxFontSize = Math.round(180 / this.props.name.length);
      return (
        <div style={{
          width: 105 * this.props.scale,
          height: 20 * this.props.scale,
          fontSize: Math.min(maxFontSize, 16) * this.props.scale
        }}>
          {this.props.name}
        </div>
      );
    } else {
      return (
        <Textfit
          mode="multi"
          autoResize={false}
          max={16 * this.props.scale}
          style={{
            width: 105 * this.props.scale,
            height: 23 * this.props.scale
        }}>
          {this.props.name}
        </Textfit>
      );
    }
  }

  renderText() {
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
          max={14 * this.props.scale}
          style={this.textFitStyle}
        >
          {this.props.text}
        </Textfit>
      );
    }
  }

  renderStat(type) {
    return (
      <CardStat type={type} base={this.props.cardStats[type]} current={this.props.stats[type]} scale={this.props.scale}/>
    );
  }

  renderStatsArea() {
    const style = {
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

  render() {
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
          transform: transform
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
                  width: 140 * this.props.scale,
                  height: 211 * this.props.scale,
                  marginRight: 10 * this.props.scale,
                  borderRadius: 5 * this.props.scale,
                  userSelect: 'none',
                  cursor: 'pointer',
                  border: this.props.source === 'builtin' ? '3px solid #888' : '3px solid #f44336',
                  position: 'relative'
                }, (this.props.selected || this.props.targetable ? selectedStyle : {}))}
              >
                <CardHeader
                  style={{padding: 8 * this.props.scale, height: 'auto'}}
                  title={this.renderTitle()}
                  titleStyle={{fontSize: 15 * this.props.scale}}
                  subtitle={typeToString(this.props.type)}
                  subtitleStyle={{fontSize: 14 * this.props.scale}} />

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
}
