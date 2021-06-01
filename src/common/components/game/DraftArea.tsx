import { without } from 'lodash';
import * as React from 'react';

import { BACKGROUND_Z_INDEX, BLUE_PLAYER_COLOR, ORANGE_PLAYER_COLOR } from '../../constants';
import * as w from '../../types';
import { opponent } from '../../util/game';
import { Card } from '../card/Card';

import ForfeitButton from './ForfeitButton';
import LeftControls from './LeftControls';
import PlayerName from './PlayerName';

interface DraftAreaProps {
  player: w.PlayerColor | 'neither'
  usernames: w.PerPlayer<string>
  draft: w.DraftState
  isGameOver: boolean
  volume: number
  onForfeit: (winner: w.PlayerColor) => void
  onDraftCards: (player: w.PlayerColor, cards: w.CardInGame[]) => void
  onSetVolume: (volume: number) => void
  onToggleFullscreen: () => void
}

interface DraftAreaState {
  selectedCardIds: w.CardId[]
}

export default class DraftArea extends React.Component<DraftAreaProps, DraftAreaState> {
  public state: DraftAreaState = {
    selectedCardIds: []
  };

  get numCardsYouHaveDrafted(): number | undefined {
    const { draft, player } = this.props;
    if (player !== 'neither') {
      return draft[player].cardsDrafted.length;
    }
  }

  get numCardsOpponentHasDrafted(): number | undefined {
    const { draft, player } = this.props;
    if (player !== 'neither') {
      return draft[opponent(player)].cardsDrafted.length;
    }
  }

  get currentCardGroup(): w.CardInGame[] | null {
    const { draft, player } = this.props;
    if (player !== 'neither') {
      return draft[player].cardGroupsToShow[0] || null;
    } else {
      return null;
    }
  }

  public render(): JSX.Element {
    const {
      player, usernames, draft, isGameOver, volume,
      onForfeit, onSetVolume, onToggleFullscreen
    } = this.props;
    const { selectedCardIds } = this.state;

    if (player === 'neither') {
      // TODO what to render when player is 'neither' (e.g. spectator)?
      return <div>TODO</div>;
    } else {
      return (
        <div
          className="background"
          style={{
            display: 'flex',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ width: 200 }}>
            <PlayerName
              opponent
              color={opponent(player)}
              playerName={usernames[opponent(player)]}
            />
            <PlayerName
              color={player}
              playerName={usernames[player]}
            />

            <div style={this.getCardCountStyle(opponent(player))}>
              {this.numCardsOpponentHasDrafted}/30 cards
            </div>
            <LeftControls
              player={player}
              currentTurn="draft"
              draft={draft}
              isTimerEnabled={!isGameOver}
              volume={volume}
              style={{ marginLeft: 200 }}
              onPassTurn={onForfeit}
              onSetVolume={onSetVolume}
              onToggleFullscreen={onToggleFullscreen}
            />
            <div style={this.getCardCountStyle(player)}>
              {this.numCardsYouHaveDrafted}/30 cards
            </div>
          </div>

          <div style={{ width: 500 }}>
            {
              this.currentCardGroup
              ? (
                <div>
                  <div style={{
                    fontFamily: 'Carter One',
                    color: 'white',
                    textAlign: 'center'
                  }}>
                    Choose two cards.
                  </div>
                  <div style={{
                    minHeight: '100%',
                    margin: '0 auto',
                    display: 'flex',
                    flexFlow: 'row wrap',
                  }}>
                    {this.currentCardGroup?.map((card, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          flexBasis: 'calc(50% - 40px)',
                          justifyContent: 'center',
                          flexDirection: 'column',
                          margin: '0 auto',
                        }}
                      >
                        {Card.fromObj(card, {
                          selected: selectedCardIds.includes(card.id),
                          onCardClick: () => this.handleSelectCard(card)
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )
              : (
                <div style={{
                  fontFamily: 'Carter One',
                  color: 'white',
                  textAlign: 'center',
                  fontSize: '2em'
                }}>
                  You&rsquo;re done!<br />Waiting for opponent ...
                </div>
              )
            }
          </div>

          <div
            className="background"
            style={{
              marginRight: 20,
              maxWidth: 220,
              textAlign: 'right',
              zIndex: BACKGROUND_Z_INDEX
            }}
          >
            <ForfeitButton
              text="abort"
              width={150}
              player={player}
              gameOver={isGameOver}
              onForfeit={onForfeit}
            />
          </div>
        </div>
      );
    }
  }

  private handleSelectCard(card: w.CardInGame): void {
    const { player, onDraftCards } = this.props;
    const { selectedCardIds } = this.state;

    if (player !== 'neither') {
      const { id } = card;
      const newSelectedCardIds = selectedCardIds.includes(id) ? without(selectedCardIds, id) : [...selectedCardIds, id];

      if (newSelectedCardIds.length === 2) {
        onDraftCards(player, this.currentCardGroup!.filter((c) => newSelectedCardIds.includes(c.id)));
        this.setState({ selectedCardIds: [] });
      } else {
        this.setState({ selectedCardIds: newSelectedCardIds });
      }
    }
  }

  private getCardCountStyle = (color: w.PlayerColor): React.CSSProperties => ({
    color: ({orange: ORANGE_PLAYER_COLOR, blue: BLUE_PLAYER_COLOR})[color],
    margin: 10,
    paddingLeft: 40,
    fontSize: '1.5em',
    fontFamily: 'VT323',
  });
}
