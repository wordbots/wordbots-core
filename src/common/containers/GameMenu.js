import React, { Component } from 'react';
import { bool, func, object, string } from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Divider from 'material-ui/Divider';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import FontIcon from 'material-ui/FontIcon';
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';

import { opponent } from '../util/game';
import * as gameActions from '../actions/game';
import * as socketActions from '../actions/socket';

export function mapStateToProps(state) {
  const activePlayer = state.game.players[state.game.player];

  return {
    player: state.game.player,
    currentTurn: state.game.currentTurn,
    isMyTurn: state.game.currentTurn === state.game.player,
    selectedPiece: activePlayer ? activePlayer.robotsOnBoard[activePlayer.selectedTile] : undefined
  };
}

export function mapDispatchToProps(dispatch) {
  return {
    onActivate: (abilityIdx) => {
      dispatch(gameActions.activateObject(abilityIdx));
    },
    onForfeit: (winner) => {
      dispatch([
        socketActions.forfeit(winner),
        socketActions.leave()
      ]);
    },
    onPassTurn: (player) => {
      dispatch(gameActions.passTurn(player));
    }
  };
}

export class GameMenu extends Component {
  static propTypes = {
    open: bool,

    player: string,
    currentTurn: string,
    isMyTurn: bool,
    selectedPiece: object,

    onActivate: func,
    onForfeit: func,
    onPassTurn: func
  };

  constructor(props) {
    super(props);

    this.state = {
      selectedAbility: 0,
      timer: '1:30',
      timerStyle: {
        color: 'white',
        textAlign: 'center',
        fontSize: '24',
        fontWeight: 'normal',
        fontFamily: 'Carter One',
        cursor: 'default'
      }
    };
  }

  componentDidMount() {
    setInterval(() => {
      this.tickTimer();
    }, 1000);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.currentTurn !== this.props.currentTurn) {
      this.resetTimer();
    }
  }

  resetTimer() {
    this.setTimer(1, 30, 'white');
  }

  padDigits(seconds) { 
    return (seconds < 10 ? '0' : '') + seconds;
  }

  setTimer(minutes, seconds, color) {
    this.setState({
      selectedAbility: this.state.selectedAbility,
      timer: `${minutes}:${seconds}`,
      timerStyle: {
        color: color,
        textAlign: 'center',
        backgroundColor: {orange: '#ffb85d', blue: '#badbff'}[this.props.currentTurn],
        fontSize: 24,
        fontWeight: color === 'red' ? 'bold' : 'normal',
        fontFamily: 'Carter One',
        cursor: 'default'
      }
    });
  }

  tickTimer() {
    const [, minutes, seconds] = this.state.timer.match(/(.):(..)/).map(num => parseInt(num));

    if (minutes === 1) {
      if (seconds === 0) {
        this.setTimer(0, 59, 'white');
      } else {
        this.setTimer(1, this.padDigits(seconds - 1), 'white');
      }
    } else if (seconds > 0 && seconds <= 6) {
      this.setTimer(0, this.padDigits(seconds - 1), 'red');
    } else if (seconds > 0) {
      this.setTimer(0, this.padDigits(seconds - 1), 'white');      
    } else {
      if (this.props.isMyTurn) {
        this.props.onPassTurn(this.props.player);
      }
    } 
  }

  render() {
    const abilities = (this.props.selectedPiece && this.props.selectedPiece.activatedAbilities) || [];
    const canActivateAbility = (abilities.length > 0) && !this.props.selectedPiece.cantActivate ;

    return (
      <Drawer
        open={this.props.open}
        containerStyle={{
          top: 64
      }}>
        <MenuItem 
          primaryText={this.state.timer} 
          style={this.state.timerStyle} />
        <Divider />
        <MenuItem
          primaryText="End Turn"
          disabled={!this.props.isMyTurn}
          leftIcon={<FontIcon className="material-icons">timer</FontIcon>}
          onClick={() => { this.props.onPassTurn(this.props.player); }} />
        <MenuItem
          primaryText="Forfeit"
          leftIcon={<FontIcon className="material-icons">close</FontIcon>}
          onClick={() => { this.props.onForfeit(opponent(this.props.player)); }} />
        <Divider />
        <MenuItem
          primaryText="Activate Ability"
          disabled={!this.props.isMyTurn || !canActivateAbility}
          leftIcon={<FontIcon className="material-icons">star</FontIcon>}
          rightIcon={<ArrowDropRight />}
          menuItems={abilities.map((ability, idx) =>
            <MenuItem
              primaryText={`${ability.text}.`}
              onClick={() => { this.props.onActivate(idx); }} />
          )}
        />
        <Divider />
      </Drawer>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(GameMenu));
