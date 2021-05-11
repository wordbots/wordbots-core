import { History } from 'history';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import * as React from 'react';

import * as w from '../../types';
import { opponent } from '../../util/game';

interface ForfeitButtonProps {
  player: w.PlayerColor | null
  compact?: boolean
  history: History
  gameOver?: boolean
  isSpectator?: boolean
  isTutorial?: boolean
  onForfeit: (player: w.PlayerColor) => void
}

export default class ForfeitButton extends React.Component<ForfeitButtonProps> {
  public render(): JSX.Element {
    const { compact, gameOver, isSpectator } = this.props;

    return (
      <Button
        className="forfeit-button"
        variant="contained"
        style={{
          backgroundColor: 'black',
          border: '1px solid white',
          borderRadius: 5,
          width: compact ? 150 : 220,
          height: compact ? 26 : 36,
          marginTop: 5,
          padding: compact ? 5 : 10,
          color: '#FFF',
          fontFamily: 'Carter One'
        }}
        onClick={this.handleClick}
        disabled={isSpectator || gameOver}
      >
        <Icon
          className="material-icons"
          style={{ color: '#ffffff' }}
        >
          flag
        </Icon>
        Forfeit
      </Button>
    );
  }

  private handleClick = () => {
    const { player, isTutorial, history, onForfeit } = this.props;

    if (player) {
      if (isTutorial) {
        onForfeit(opponent(player));
        history.push('/play');
      } else {
        if (confirm('Are you sure you want to forfeit?')) {
          onForfeit(opponent(player));
        }
      }
    }
  }
}
