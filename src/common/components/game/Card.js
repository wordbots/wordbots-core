import React, { Component } from 'react';
import Divider from 'material-ui/lib/divider';
import CardHeader from 'material-ui/lib/card/card-header';
import CardText from 'material-ui/lib/card/card-text';
import Paper from 'material-ui/lib/paper';
import Badge from 'material-ui/lib/badge';
import CardStat from './CardStat';
import CardBack from './CardBack';
import { TYPE_ROBOT } from '../../constants';

class Card extends Component {
  constructor(props) {
    super(props);

    this.state = {
      shadow: 2
    }

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
        <CardText style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: 10
        }}>
          <CardStat type="attack" value={this.props.cardStats.attack}/>
          <CardStat type="speed" value={this.props.cardStats.speed}/>
          <CardStat type="health" value={this.props.cardStats.health}/>
        </CardText>
      );
    } else {
      return '';
    }
  }

  render() {
    let cardSubtitle = '';
    let selectedStyle = {};

    if (this.props.type == TYPE_ROBOT) {
      cardSubtitle = 'Robot';
    } else {
      cardSubtitle = 'Event';
    }

    if (this.props.selected) {
      if (this.props.status.type === 'error') {
        selectedStyle = {
          boxShadow: 'rgba(255, 35, 35, 0.95) 0px 0px 20px 5px'
        }
      } else {
        selectedStyle = {
          boxShadow: 'rgba(27, 134, 27, 0.95) 0px 0px 20px 5px'
        }
      }
    }

    if (!this.props.visible) {
      return (
        <CardBack />
      )
    } else {
      return (
        <Badge
          badgeContent={this.props.cost}
          badgeStyle={{
            top: 12,
            right: 20,
            width: 36,
            height: 36,
            backgroundColor: '#00bcd4',
            fontFamily: 'Luckiest Guy',
            color: 'white',
            fontSize: 16
          }}
        >
          <div onClick={this.props.onCardClick}>
            <Paper
              onMouseOver={this.onMouseOver}
              onMouseOut={this.onMouseOut}
              zDepth={this.state.shadow}
              style={Object.assign({
                width: 140,
                height: 200,
                marginRight: 10,
                borderRadius: 5,
                display: 'flex',
                flexDirection: 'column',
                userSelect: 'none',
                cursor: 'pointer'
            }, selectedStyle)}>
              <CardHeader
                style={{padding: 10, height: 'auto'}}
                title={this.props.name}
                subtitle={cardSubtitle}/>
              <Divider/>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                flexDirection: 'column',
                flexGrow: 1
              }}>
                <CardText style={{padding: 10}}>{this.props.text}</CardText>
                {this.renderStatsArea()}
              </div>
            </Paper>
          </div>
        </Badge>
      )
    }
  }
}

Card.propTypes = {
  name: React.PropTypes.string,
  type: React.PropTypes.number,
  text: React.PropTypes.string,
  cardStats: React.PropTypes.object,
  visible: React.PropTypes.bool,
  selected: React.PropTypes.bool,
  status: React.PropTypes.object,
  cost: React.PropTypes.number,
  onCardClick: React.PropTypes.func
}

export default Card;
