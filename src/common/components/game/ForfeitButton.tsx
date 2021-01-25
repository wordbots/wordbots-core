import { History } from 'history';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import * as React from 'react';

import { MAX_Z_INDEX } from '../../constants';
import * as w from '../../types';
import { opponent } from '../../util/game';
import Tooltip from '../Tooltip';

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
    const height = compact ? '40px' : '64px';

    return (
      <Tooltip text="Forfeit" place="top" style={{ zIndex: MAX_Z_INDEX }}>
        <Button
          className="forfeit-button"
          variant="contained"
          style={{
            backgroundColor: 'black',
            border: '2px solid white',
            borderRadius: 5,
            height,
            marginLeft: 10,
            minWidth: 48,
            padding: 10
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
        </Button>
      </Tooltip>
    );
  }

  private handleClick = () => {
    const { player, isTutorial, history, onForfeit } = this.props;

    if (player) {
      onForfeit(opponent(player));
      if (isTutorial) {
        history.push('/play');
      }
    }
  }
}
