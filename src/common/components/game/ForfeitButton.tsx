import { History } from 'history';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import * as React from 'react';

import * as w from '../../types';
import { opponent } from '../../util/game';

interface ForfeitButtonProps {
  player: w.PlayerColor | null
  compact?: boolean
  text?: string
  width?: number
  history?: History
  gameOver?: boolean
  isSpectator?: boolean
  isTutorial?: boolean
  isSandbox?: boolean
  onForfeit: (player: w.PlayerColor) => void
}

/** TODO really we should factor out SmallRightButton as a separate component instead? */
export const smallRightButtonStyle = (compact?: boolean, width?: number): React.CSSProperties => ({
  backgroundColor: 'black',
  border: '1px solid white',
  borderRadius: 5,
  width: width || (compact ? 150 : 220),
  height: compact ? 26 : 36,
  marginTop: 5,
  padding: compact ? 5 : 10,
  color: '#FFF',
  fontFamily: '"Carter One", "Carter One-fallback"'
});

export default class ForfeitButton extends React.Component<ForfeitButtonProps> {
  public render(): JSX.Element {
    const { compact, gameOver, text, width } = this.props;

    return (
      <Button
        className="forfeit-button"
        variant="contained"
        style={smallRightButtonStyle(compact, width)}
        onClick={this.handleClick}
        disabled={gameOver}
      >
        <Icon
          className="material-icons"
          style={{ color: '#ffffff' }}
        >
          flag
        </Icon>
        {text || 'Forfeit'}
      </Button>
    );
  }

  private handleClick = () => {
    const { player, isSpectator, isSandbox, isTutorial, text, history, onForfeit } = this.props;

    if (isSpectator) {
      history!.push('/play');
    } else if (player) {
      if (isTutorial) {
        onForfeit(opponent(player));
        history!.push('/play');
      } else if (isSandbox) {
        onForfeit(opponent(player));
      } else {
        if (confirm(`Are you sure you want to ${text ? text.toLocaleLowerCase() : 'forfeit'}?`)) {
          onForfeit(opponent(player));
        }
      }
    }
  }
}
