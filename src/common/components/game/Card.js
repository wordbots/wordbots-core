import React, { Component } from 'react';
import { array, bool, func, number, object, oneOfType, string } from 'prop-types';
import Divider from 'material-ui/Divider';
import { CardHeader, CardText } from 'material-ui/Card';
import Paper from 'material-ui/Paper';
import Badge from 'material-ui/Badge';
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { isEqual } from 'lodash';

import { TYPE_ROBOT, TYPE_CORE, TYPE_EVENT, TYPE_STRUCTURE, typeToString } from '../../constants';
import { compareCertainKeys, isHeadless } from '../../util/common';
import loadImages from '../react-hexgrid/HexGridImages';
import Textfit from '../react-textfit/Textfit';

import CardStat from './CardStat';
import CardBack from './CardBack';
import Identicon from './Identicon';
import Sprite from './Sprite';

export default class Card extends Component {
  static propTypes = {
    children: oneOfType([string, array]),

    id: string,
    name: string,
    spriteID: string,
    type: number,
    text: oneOfType([string, array]),
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

    visible: true,
    selected: false,

    scale: 1,
    margin: 0,
    rotation: 0,
    yTranslation: 0,
    zIndex: 0,

    onCardClick: () => {},
    onCardHover: () => {},
    onSpriteClick: () => {}
  }

  static childContextTypes = {
    muiTheme: object.isRequired
  };
  getChildContext() {
    return {muiTheme: getMuiTheme(baseTheme)};
  }

  constructor(props) {
    super(props);

    this.state = {
      shadow: 2
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    const trackedProps = [
      'name', 'spriteID', 'type', 'rawText', 'parseResults',
      'cardStats', 'stats', 'image', 'cost', 'baseCost',
      'status', 'visible', 'selected', 'targetable',
      'margin', 'zIndex'
    ];

    return !compareCertainKeys(nextProps, this.props, trackedProps) || !isEqual(nextState, this.state);
  }

  onMouseEnter() {
    this.setState({
      shadow: 3
    });
  }

  onMouseLeave() {
    this.setState({
      shadow: 2
    });
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
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: isHeadless() ? 20 : 0
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
      height: (this.props.type !== TYPE_EVENT ? 48 : 96) * this.props.scale,
      boxSizing: 'border-box'
    };

    const compactStyle = {
      paddingBottom: 6 * this.props.scale,
      height: 'auto',
      textAlign: 'center'
    };

    if (this.props.type === TYPE_EVENT && this.numChars < 30) {
      return Object.assign(baseStyle, compactStyle);
    } else {
      return baseStyle;
    }
  }

  get costBadgeStyle() {
    if (this.props.cost < this.props.baseCost) {
      return {
        color: '#81C784',
        WebkitTextStroke: '0.5px white'
      };
    } else if (this.props.cost > this.props.baseCost) {
      return {
        color: '#E57373',
        WebkitTextStroke: '0.5px white'
      };
    } else {
      return {};
    }
  }

  renderTitle() {
    if (isHeadless()) {
      // Textfit won't work without a DOM, so just estimate something reasonable.
      const maxFontSize = Math.round(180 / this.props.name.length);
      return (
        <div style={{width: 105, height: 20, fontSize: Math.min(maxFontSize, 16)}}>
          {this.props.name}
        </div>
      );
    } else {
      return (
        <Textfit
          mode="multi"
          max={16 * this.props.scale}
          style={{width: 105 * this.props.scale, height: 23 * this.props.scale}}>
          {this.props.name}
        </Textfit>
      );
    }
  }

  renderImage() {
    if (isHeadless()) {
      const [width, height] = [50 * this.props.scale, 52 * this.props.scale];
      return (
        <div style={{ width, height }} />
      );
    } if (this.props.type === TYPE_CORE) {
      const [width, height] = [50 * this.props.scale, 52 * this.props.scale];
      return (
        <div style={{
          width: width,
          height: height,
          margin: '3px auto 0'
        }}>
          <img src={loadImages()[this.props.img]} width={width} height={height} />
        </div>
      );
    } else if (this.props.type === TYPE_EVENT) {
      const [width, height] = [25 * this.props.scale, 42 * this.props.scale];
      return (
        <div
          onClick={this.props.onSpriteClick ? this.props.onSpriteClick : () => {}}
          style={{
            width: width,
            height: height,
            margin: `${10 * this.props.scale}px auto 0`
        }}>
          <Identicon id={this.props.spriteID || this.props.name} width={width} size={4} />
        </div>
      );
    } else {
      return (
        <div
          onClick={this.props.onSpriteClick ? this.props.onSpriteClick : () => {}}
          style={{
            width: 48 * this.props.scale,
            height: 48 * this.props.scale,
            margin: '2px auto 3px'
        }}>
          <Sprite id={this.props.spriteID || this.props.name} size={24} scale={this.props.scale} output="html" />
        </div>
      );
    }
  }

  renderText() {
    if (isHeadless()) {
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
      display: 'flex',
      justifyContent: 'space-between',
      padding: 10 * this.props.scale
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
          <Badge
            badgeContent={
              <div style={isHeadless() ? {
                paddingTop: 10,
                textAlign: 'center',
                fontFamily: 'Arial',
                fontWeight: 'bold'
              } : {}}>
                {this.props.cost}
              </div>
            }
            badgeStyle={Object.assign({
              top: 12,
              right: -4,
              width: 36 * this.props.scale,
              height: 36 * this.props.scale,
              backgroundColor: '#00bcd4',
              fontFamily: 'Carter One',
              color: 'white',
              fontSize: 16 * this.props.scale
            }, this.costBadgeStyle)}
            style={{
              paddingLeft: 0,
              paddingRight: 0,
              marginRight: this.props.margin,
              zIndex: this.props.zIndex || 0,
              transform: transform
            }}
          >
            <div
              onClick={() => { this.props.onCardClick(this.props.id); }}
              onMouseEnter={e => { this.onMouseEnter(); this.props.onCardHover(true); }}
              onMouseLeave={e => { this.onMouseLeave(); this.props.onCardHover(false); }}
            >
              <Paper
                zDepth={this.state.shadow}
                style={Object.assign({
                  width: 140 * this.props.scale,
                  height: 211 * this.props.scale,
                  marginRight: 10 * this.props.scale,
                  borderRadius: 5 * this.props.scale,
                  userSelect: 'none',
                  cursor: 'pointer',
                  border: this.props.source === 'builtin' ? '3px solid #888' : '3px solid #f44336'
                }, (this.props.selected || this.props.targetable ? selectedStyle : {}))}
              >
                <CardHeader
                  style={{padding: 8 * this.props.scale, height: 'auto'}}
                  title={this.renderTitle()}
                  titleStyle={{fontSize: 15 * this.props.scale}}
                  subtitle={typeToString(this.props.type)}
                  subtitleStyle={{fontSize: 14 * this.props.scale}} />

                <Divider/>

                {this.renderImage()}

                <Divider/>

                <div style={this.textAreaStyle}>
                  {this.renderText()}
                  {this.renderStatsArea()}
                </div>
              </Paper>
            </div>
          </Badge>
        </div>
      );
    }
  }
}
