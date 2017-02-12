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

  renderStatsArea() {
    if (this.props.type == TYPE_ROBOT) {
      return (
        <CardText style={{ display: 'flex', justifyContent: 'space-between', padding: 10}}>
          <CardStat type="attack" base={this.props.cardStats.attack} current={this.props.stats.attack}/>
          <CardStat type="speed" base={this.props.cardStats.speed} current={this.props.stats.speed}/>
          <CardStat type="health" base={this.props.cardStats.health} current={this.props.stats.health}/>
        </CardText>
      );
    } else if (this.props.type == TYPE_CORE || this.props.type == TYPE_STRUCTURE) {
      return (
        <CardText style={{ display: 'flex', justifyContent: 'space-between', padding: 10}}>
          <CardStat type="health" base={this.props.cardStats.health} current={this.props.stats.health}/>
        </CardText>
      );
    } else {
      return '';
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

  renderImage() {
    if (this.props.img) {
      return (
        <div style={{ width: '50px', height: '52px', margin: '3px auto 0'}}>
          <img src={loadImages()[this.props.img]} width="50px" height="50px" />
        </div>
      );
    } else {
      return (
        <div style={{ width: '50px', height: '52px', margin: '5px auto 0'}}>
          <Identicon id={this.props.name} width={40} size={5} />
        </div>
      );
    }
  }

  render() {
    const redShadow = 'rgba(255, 35, 35, 0.95)';
    const greenShadow = 'rgba(27, 134, 27, 0.95)';
    const selectedStyle = {
      boxShadow: ((this.props.status && this.props.status.type === 'error') ? redShadow : greenShadow) + ' 0px 0px 20px 5px'
    };

    if (!this.props.visible) {
      return (
        <CardBack />
      );
    } else {
      return (
        <Badge
          badgeContent={this.props.cost}
          badgeStyle={Object.assign({
            top: 12,
            right: 20,
            width: 36,
            height: 36,
            backgroundColor: '#00bcd4',
            fontFamily: 'Carter One',
            color: 'white',
            fontSize: 16
          }, this.costBadgeStyle())}
          style={{paddingLeft: 0}}
        >
          <div onClick={this.props.onCardClick}>
            <Paper
              onMouseOver={this.onMouseOver}
              onMouseOut={this.onMouseOut}
              zDepth={this.state.shadow}
              style={Object.assign({
                width: 140,
                height: 206,
                marginRight: 10,
                borderRadius: 5,
                userSelect: 'none',
                cursor: 'pointer'
              }, (this.props.selected ? selectedStyle : {}))}>
              <CardHeader
                style={{padding: 8, height: 'auto'}}
                title={this.props.name}
                subtitle={typeToString(this.props.type)}/>

              <Divider/>

              {this.renderImage()}

              <Divider/>

              <div style={{
                height: 90
              }}>
                <Textfit mode="multi" max={14} style={{
                  padding: 6,
                  paddingBottom: 0,
                  height: this.props.type != TYPE_EVENT ? 44 : 96,
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
  type: React.PropTypes.number,
  text: React.PropTypes.string,
  img: React.PropTypes.string,
  cardStats: React.PropTypes.object,
  visible: React.PropTypes.bool,
  selected: React.PropTypes.bool,
  status: React.PropTypes.object,
  cost: React.PropTypes.number,
  baseCost: React.PropTypes.number,
  onCardClick: React.PropTypes.func,
  stats: React.PropTypes.object
};

export default Card;
