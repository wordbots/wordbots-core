import { History } from 'history';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import * as React from 'react';

import * as w from '../../types';
import { opponent } from '../../util/game';

import { smallRightButtonStyle } from './ForfeitButton';

interface OfferDrawButtonProps {
  player: w.PlayerColor
  drawOffers: w.PlayerColor[]
  compact?: boolean
  width?: number
  history?: History
  gameOver?: boolean
  onOfferDraw: (player: w.PlayerColor) => void
  onRetractDrawOffer: (player: w.PlayerColor) => void
}

export default class OfferDrawButton extends React.Component<OfferDrawButtonProps> {
  public render(): JSX.Element {
    const { compact, drawOffers, gameOver, player, width } = this.props;
    const text =
      gameOver
        ? `Draw${compact ? '' : ' Accepted'}`
        : drawOffers.includes(player)
          ? `Retract Draw${compact ? '' : ' Offer'}`
          : drawOffers.includes(opponent(player))
            ? `Accept Draw${compact ? '' : ' Offer'}`
            : 'Offer Draw';
    const shouldBlink = !gameOver && drawOffers.length > 0;

    return (
      <Button
        className={`draw-button ${shouldBlink ? 'blink' : ''}`}
        variant="contained"
        style={smallRightButtonStyle(compact, width)}
        onClick={this.handleClick}
        disabled={gameOver}
      >
        <Icon
          className="material-icons"
          style={{ color: '#ffffff' }}
        >
          handshake
        </Icon>
        {text}
      </Button>
    );
  }

  private handleClick = () => {
    const { drawOffers, player, onOfferDraw, onRetractDrawOffer } = this.props;

    if (drawOffers.includes(player)) {
      onRetractDrawOffer(player);
    } else {
      onOfferDraw(player);
    }
  }
}
