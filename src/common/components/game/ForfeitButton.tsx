import { History } from 'history';
import FontIcon from 'material-ui/FontIcon';
import RaisedButton from 'material-ui/RaisedButton';
import * as React from 'react';

import { MAX_Z_INDEX } from '../../constants';
import * as w from '../../types';
import { opponent } from '../../util/game';
import Tooltip from '../Tooltip';

interface ForfeitButtonProps {
  player: w.PlayerColor | null
  history: History
  gameOver?: boolean
  isSpectator?: boolean
  isTutorial?: boolean
  onForfeit: (player: w.PlayerColor) => void
}

export default class ForfeitButton extends React.Component<ForfeitButtonProps> {
  public render(): JSX.Element {
    return (
      <Tooltip text="Forfeit" place="top" style={{ zIndex: MAX_Z_INDEX }}>
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
          onClick={this.handleClick}
          icon={
            <FontIcon
              className="material-icons"
              style={{
                lineHeight: '64px',
                verticalAlign: 'none'
              }}
            >
              flag
            </FontIcon>
          }
          disabled={this.props.isSpectator || this.props.gameOver}
        />
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
