import React, { Component } from 'react';
import Divider from 'material-ui/lib/divider';
import CardHeader from 'material-ui/lib/card/card-header';
import CardText from 'material-ui/lib/card/card-text';
import Paper from 'material-ui/lib/paper';
import Badge from 'material-ui/lib/badge';
import { Textfit } from 'react-textfit';

import { TYPE_ROBOT, TYPE_CORE, TYPE_EVENT, TYPE_STRUCTURE, typeToString } from '../../constants';
import loadImages from '../react-hexgrid/HexGridImages';

import CardStat from './CardStat';
import CardBack from './CardBack';
import Identicon from './Identicon';
import Sprite from './Sprite';

class Card extends Component {
  constructor(props) {
    super(props);

    this.state = {
      shadow: 2
    };

    this.onMouseOver = this.onMouseOver.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
  }

  onMouseOver() {
    this.setState({
      shadow: 3
    });
  }

  onMouseOut() {
    this.setState({
      shadow: 2
    });
  }

  textAreaStyle() {
    const baseStyle = {
      height: 106 * this.props.scale
    };

    const compactStyle = {
      textAlign: 'center',
      marginTop: 30 * this.props.scale
    };

    const numChars = this.props.rawText ? this.props.rawText.length : this.props.text.length;

    if (this.props.type === TYPE_EVENT && numChars < 30) {
      return Object.assign(baseStyle, compactStyle);
    } else {
      return baseStyle;
    }
  }

  costBadgeStyle() {
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
          {this.renderStat('speed')}
          {this.renderStat('health')}
        </CardText>
      );
    } else if (this.props.type === TYPE_CORE || this.props.type === TYPE_STRUCTURE) {
      return (
        <CardText style={Object.assign(style, {float: 'right'})}>
          {this.renderStat('health')}
        </CardText>
      );
    }
  }

  renderImage() {
    if (this.props.type === TYPE_CORE) {
      return (
        <div style={{ width: 50 * this.props.scale, height: 52 * this.props.scale, margin: '3px auto 0'}}>
          <img src={loadImages()[this.props.img]} width={50 * this.props.scale} height={50 * this.props.scale} />
        </div>
      );
    } else if (this.props.type === TYPE_EVENT) {
      return (
        <div
          onClick={this.props.onSpriteClick ? this.props.onSpriteClick : () => {}}
          style={{
            width: 25 * this.props.scale,
            height: 42 * this.props.scale,
            margin: '0 auto',
            marginTop: 10 * this.props.scale
        }}>
          <Identicon id={this.props.spriteID || this.props.name} width={25 * this.props.scale} size={4} />
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

  render() {
    const redShadow = 'rgba(255, 35, 35, 0.95)';
    const greenShadow = 'rgba(27, 134, 27, 0.95)';
    const selectedStyle = {
      boxShadow: `${(this.props.status && this.props.status.type === 'error') ? redShadow : greenShadow  } 0px 0px 20px 5px`
    };

    if (!this.props.visible) {
      return (
        <CardBack cardMargin={this.props.cardMargin} />
      );
    } else {
      return (
        <Badge
          badgeContent={this.props.cost}
          badgeStyle={Object.assign({
            top: 12,
            right: 20,
            width: 36 * this.props.scale,
            height: 36 * this.props.scale,
            backgroundColor: '#00bcd4',
            fontFamily: 'Carter One',
            color: 'white',
            fontSize: 16 * this.props.scale
          }, this.costBadgeStyle())}
          style={{
            paddingLeft: 0,
            marginRight: this.props.cardMargin,
            zIndex: this.props.hovered ? 1000 : 0
          }}
        >
          <div onClick={this.props.onCardClick} onMouseEnter={this.props.onCardHover}>
            <Paper
              onMouseOver={this.onMouseOver}
              onMouseOut={this.onMouseOut}
              zDepth={this.state.shadow}
              style={Object.assign({
                width: 140 * this.props.scale,
                height: 211 * this.props.scale,
                marginRight: 10 * this.props.scale,
                borderRadius: 5 * this.props.scale,
                userSelect: 'none',
                cursor: 'pointer'
              }, (this.props.selected || this.props.targetable ? selectedStyle : {}))}>
              <CardHeader
                style={{padding: 8 * this.props.scale, height: 'auto'}}
                title={
                  <Textfit
                    mode="multi"
                    style={{width: 100 * this.props.scale, height: 23 * this.props.scale}}>
                    {this.props.name}
                  </Textfit>
                }
                titleStyle={{fontSize: 15 * this.props.scale}}
                subtitle={typeToString(this.props.type)}
                subtitleStyle={{fontSize: 14 * this.props.scale}} />

              <Divider/>

              {this.renderImage()}

              <Divider/>

              <div style={this.textAreaStyle()}>
                <Textfit
                  mode="multi"
                  max={14 * this.props.scale}
                  style={{
                    padding: 6 * this.props.scale,
                    paddingBottom: 0,
                    height: (this.props.type !== TYPE_EVENT ? 54 : 106) * this.props.scale,
                    boxSizing: 'border-box'
                }}>
                  {this.props.text}
                </Textfit>
                {this.renderStatsArea()}
              </div>
            </Paper>
          </div>
        </Badge>
      );
    }
  }
}

Card.propTypes = {
  name: React.PropTypes.string,
  spriteID: React.PropTypes.string,
  type: React.PropTypes.number,
  text: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.array]),
  rawText: React.PropTypes.string,
  img: React.PropTypes.string,
  cardStats: React.PropTypes.object,
  visible: React.PropTypes.bool,
  hovered: React.PropTypes.bool,
  selected: React.PropTypes.bool,
  targetable: React.PropTypes.bool,
  status: React.PropTypes.object,
  cost: React.PropTypes.number,
  baseCost: React.PropTypes.number,
  onCardClick: React.PropTypes.func,
  onCardHover: React.PropTypes.func,
  onSpriteClick: React.PropTypes.func,
  stats: React.PropTypes.object,
  scale: React.PropTypes.number,
  cardMargin: React.PropTypes.number
};

export default Card;
