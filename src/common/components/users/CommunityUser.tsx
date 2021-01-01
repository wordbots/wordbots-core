import Paper from '@material-ui/core/Paper';
import { DoubleBounce } from 'better-react-spinkit';
import { History } from 'history';
import * as React from 'react';

import { Card } from '../card/Card';
import ProfileLink from '../users/ProfileLink';
import * as w from '../../types';
import { mostRecentCards } from '../../util/firebase';

interface CommunityUserProps {
  user: w.User
  history: History
}

interface CommunityUserState {
  mostRecentCard?: w.CardInStore | null
}

export default class CommunityUser extends React.Component<CommunityUserProps, CommunityUserState> {
  public state: CommunityUserState = {};

  public async componentDidMount(): Promise<void> {
    await this.loadMostRecentCard();
  }

  public render(): JSX.Element {
    const { user } = this.props;
    const card = this.state.mostRecentCard;
    const info = user.info!;
    const statistics = user.statistics!;

    return (
      <Paper key={info.uid} style={{ width: 280, marginRight: 20, marginBottom: 20, padding: 10 }}>
        <div style={{ float: 'left', width: 130 }}>
          <ProfileLink uid={info.uid} username={info.displayName!} style={{ fontWeight: 'bold', fontSize: '1.2em' }} />
          <p><b>{statistics['cardsCreated'] || 0}</b> cards created</p>
          <p><b>{statistics['decksCreated'] || 0}</b> decks created</p>
          <p><b>{statistics['setsCreated'] || 0}</b> sets created</p>
          <p><b>{statistics['gamesPlayed'] || 0}</b> games played</p>
        </div>
        {card !== null && (
          <div style={{ float: 'right', width: 130 }}>
            {
              card
                ? Card.fromObj(card, { scale: 0.8, onCardClick: () => { this.handleClickCard(card); }})
                : <div style={{ margin: '80px 40px' }}><DoubleBounce size={50} /></div>
            }
            <div style={{ textAlign: 'center', color: '#999', fontSize: '0.7em' }}>Most recent card</div>
          </div>
        )}

      </Paper>
    );
  }

  private loadMostRecentCard = async (): Promise<void> => {
    const uid = this.props.user.info!.uid;
    const cards = await mostRecentCards(uid, 1);

    if (cards.length > 0) {
      this.setState({ mostRecentCard: cards[0] || null });
    }
  }

  private handleClickCard = (card: w.CardInStore) => {
    this.props.history.push(`/card/${card.id}`, { card });
  }
}
