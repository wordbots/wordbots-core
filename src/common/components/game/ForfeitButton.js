import React, { Component } from 'react';
import { string, bool, object, func } from 'prop-types';
import FontIcon from 'material-ui/FontIcon';
import RaisedButton from 'material-ui/RaisedButton';

import { opponent } from '../../util/game';
import Tooltip from '../Tooltip';

export default class ForfeitButton extends Component {
  static propTypes = {
    player: string,
    gameOver: bool,
    history: object,
    isSpectator: bool,
    isTutorial: bool,

    onForfeit: func
  };

  handleClick = () => {
    this.props.onForfeit(opponent(this.props.player));

    if (this.props.isTutorial) {
      this.props.history.push('/play');
    }
  }

  render() {
    return (
      <Tooltip text="Forfeit" place="top" style={{zIndex: 99999}}>
        <RaisedButton
          backgroundColor="#CCC"
          buttonStyle={{
            height: '64px',
            lineHeight: '64px'
          }}
          style={{
            borderRadius: 5,
            border: '2px solid #AAA',
            minWidth: 48,
            marginLeft: 10
          }}
          overlayStyle={{
            height: '64px'
          }}
          onTouchTap={this.handleClick}
          icon={
            <FontIcon
              className="material-icons"
              style={{
                lineHeight: '64px',
                verticalAlign: 'none'
            }}>
              flag
            </FontIcon>
          }
          disabled={this.props.isSpectator || this.props.gameOver} />
      </Tooltip>
    );
  }
}
