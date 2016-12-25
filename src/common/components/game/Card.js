import React, { Component } from 'react';
import Divider from 'material-ui/lib/divider';
import CardHeader from 'material-ui/lib/card/card-header';
import CardText from 'material-ui/lib/card/card-text';
import Paper from 'material-ui/lib/paper';
import CardStat from './CardStat';

class Card extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selected: false,
      cardStats: this.props.cardStats,
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

  render() {
    let cardSubtitle = '';

    if (this.state.cardStats.type === 0) {
      cardSubtitle = 'Robot';
    } else {
      cardSubtitle = 'Spell';
    }

    if (this.props.opponent) {
      return (
        <div>
          <Paper 
            zDepth={2} 
            style={{
              width: 140,
              height: 200,
              marginRight: 10,
              borderRadius: 5,
              backgroundColor: '#f44336',
              boxSizing: 'border-box',
              padding: 5,
              userSelect: 'none',
              cursor: 'pointer'
          }}>
            <div style={{
              writingMode: 'vertical-lr',
              width: 'calc(100% - 4px)',
              height: 'calc(100% - 4px)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 5,
              border: '2px solid #FFF'
            }}>
              <div style={{
                color: '#fff',
                fontSize: 28,
                fontFamily: 'Luckiest Guy'
              }}>WordBots</div>
            </div>
          </Paper>
        </div>
      )
    } else {
      return (
        <div onClick={this.props.onCardClick}>
          <Paper 
            onMouseOver={this.onMouseOver}
            onMouseOut={this.onMouseOut}
            zDepth={this.state.shadow} 
            style={{
              width: 140,
              height: 200,
              marginRight: 10,
              borderRadius: 5,
              display: 'flex',
              flexDirection: 'column',
              userSelect: 'none',
              cursor: 'pointer'
          }}>
            <CardHeader 
              style={{padding: 10, height: 'auto'}}
              title={this.state.cardStats.name}
              subtitle={cardSubtitle}/>
            <Divider/>
            <div style={{
              display: 'flex', 
              justifyContent: 'space-between',
              flexDirection: 'column',
              flexGrow: 1
            }}>
              <CardText style={{padding: 10}}>Example card text.</CardText>
              <CardText style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: 10
              }}>
                <CardStat type="attack" value={this.state.cardStats.attack}/>
                <CardStat type="speed" value={this.state.cardStats.speed}/>
                <CardStat type="health" value={this.state.cardStats.health}/>
              </CardText>
            </div>
          </Paper>
        </div>
      )
    }
  }
}

Card.propTypes = {
  cardStats: React.PropTypes.object,
  opponent: React.PropTypes.bool,
  onCardClick: React.PropTypes.func
}

export default Card;
