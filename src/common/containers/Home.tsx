import { History } from 'history';
import { truncate } from 'lodash';
import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import Background from '../components/Background';
import RecentCardsCarousel from '../components/cards/RecentCardsCarousel';
import RouterDialog from '../components/RouterDialog';
import SplashSection from '../components/SplashSection';
import { FIREBASE_CONFIG, PARSER_URL } from '../constants';
import * as w from '../types';
import { isFlagSet, onLocalhost } from '../util/browser';

interface HomeStateProps {
  version: string
}

export function mapStateToProps(state: w.State): HomeStateProps {
  return {
    version: state.version
  };
}

type HomeProps = HomeStateProps & { history: History };

class Home extends React.Component<HomeProps> {
  public render(): JSX.Element {
    const { history, version: versionAndSha } = this.props;
    const [version, sha] = versionAndSha.split('+');
    const shaTruncated = truncate(sha, { length: 8, omission: '' });

    return (
      <div>
        <Helmet title="Home"/>
        <Background asset="arena_draft.png" opacity={0.06} style={{ top: -10, height: 'calc(100% + 10px)' } /* not sure where the missing 10px at the top went? */} />

        <div style={{margin: '24px 72px 36px'}}>
          <div
            style={{
              margin: '20px auto',
              maxWidth: 680,
              textAlign: 'center',
              fontSize: 24,
              color: '#666'
            }}
          >
            <div>
              Welcome to
              <span
                style={{
                  fontFamily: 'Carter One',
                  color: '#f44336',
                  WebkitTextStroke: '1px black',
                  fontSize: 28
                }}
              >&nbsp;Wordbots</span>
              , a tactical card game where you craft your own cards and use them fight in fast-paced arena battles.
            </div>
            <div style={{ marginTop: 10, fontSize: '0.85em' }}>
              All cards are player-made and no two games are the same!
            </div>
          </div>

          <div id="homePageSplash">
            <SplashSection
              title="Craft Cards!"
              imgPath="/static/splash-workshop.png"
              onClick={this.handleClickWorkshop}
            >
              Making cards in the Workshop is as easy as writing text. A magical algorithm will turn it into code for you.
            </SplashSection>
            <SplashSection
              title="Build Decks!"
              imgPath="/static/splash-decks.png"
              onClick={this.handleClickDecks}
            >
              Put together decks of 30 cards to bring to the Arena.<br />
              Or, assemble your deck on the spot in Draft mode.
            </SplashSection>
            <SplashSection
              title="Battle it Out!"
              imgPath="/static/splash-play.png"
              onClick={this.handleClickArena}
            >
              {"The cards take life in fast-paced positional battles in the Arena. Destroy your opponent's Kernel to win!"}
            </SplashSection>
          </div>

          <RecentCardsCarousel history={history} />

          {
            !isFlagSet('skipNewHere') &&
              <div className="new-here-robot" onClick={this.handleClickNewHere}>
                <div className="speech-bubble" style={{ fontFamily: 'Carter One', fontSize: 20, color: '#f44336', WebkitTextStroke: '0.5px black' }}>New here?</div>
                <img src={require('../components/img/one_bot.png')} alt="New here?" style={{ transform: 'rotate(-45deg)' }} />
              </div>
          }

          <div
            style={{
              position: 'fixed',
              bottom: 10,
              right: 10,
              padding: 5,
              opacity: 0.8,
              backgroundColor: 'white',
              color: '#333',
              fontSize: '0.7em',
            }}
          >
            v<a href={`https://github.com/wordbots/wordbots-core/releases/tag/v${version}`}>{version}</a>+{shaTruncated}
            {onLocalhost() && <span> [ <em>parser:</em> {PARSER_URL}, <em>db:</em> {FIREBASE_CONFIG.databaseURL} ]</span>}
          </div>
        </div>
      </div>
    );
  }

  private handleClickNewHere = () => {
    RouterDialog.openDialog(this.props.history, 'new-here');
  }

  private handleClickWorkshop = () => {
    this.props.history.push('card/new');
  }

  private handleClickDecks = () => {
    this.props.history.push('decks');
  }

  private handleClickArena = () => {
    this.props.history.push('play');
  }
}

export default withRouter(connect(mapStateToProps)(Home));
