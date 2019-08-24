import { History } from 'history';
import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Dispatch } from 'redux';

import * as gameActions from '../actions/game';
import RecentCardsCarousel from '../components/cards/RecentCardsCarousel';
import PaperButton from '../components/PaperButton';
import * as w from '../types';

interface HomeStateProps {
  version: string
}

interface HomeDispatchProps {
  onStartTutorial: () => void
}

export function mapStateToProps(state: w.State): HomeStateProps {
  return {
    version: state.version
  };
}

export function mapDispatchToProps(dispatch: Dispatch): HomeDispatchProps {
  return {
    onStartTutorial: () => {
      dispatch(gameActions.startTutorial());
    }
  };
}

type HomeProps = HomeStateProps & HomeDispatchProps & { history: History };

export class Home extends React.Component<HomeProps> {
  public render(): JSX.Element {
    const { history, onStartTutorial, version: versionAndSha } = this.props;
    const [version, sha] = versionAndSha.split('+');

    return (
      <div style={{margin: '48px 72px'}}>
        <Helmet title="Home"/>

        <div
          style={{
            margin: '10px 0',
            textAlign: 'center',
            fontSize: 24,
            color: '#666'
          }}
        >
          <p>
            Welcome to
            <span
              style={{
                fontFamily: 'Carter One',
                color: '#f44336',
                WebkitTextStroke: '1px black',
                fontSize: 28
              }}
            >
              Wordbots
            </span>
            , the customizable card game where <i><b>you</b></i>, the player, get to create the cards!</p>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            flexDirection: 'row'
          }}
        >
          {this.renderButton('Tutorial', () => { history.push('play/tutorial'); onStartTutorial(); })}
          {this.renderButton('Play', () => { history.push('play'); })}
          {this.renderButton('Your Cards', () => { history.push('collection'); })}
          {this.renderButton('Card Creator', () => { history.push('card/new'); })}
        </div>

        <RecentCardsCarousel history={history} />

        <div
          style={{
            position: 'fixed',
            bottom: 10,
            right: 10,
            fontSize: '0.7em'
          }}
        >
          v<a href={`https://github.com/wordbots/wordbots-core/releases/tag/v${version}`}>{version}</a>+{sha}
        </div>
      </div>
    );
  }

  private renderButton = (title: string, onClick: () => void) => (
    <PaperButton
      onClick={onClick}
      style={{
        flexBasis: 'calc(50% - 60px)',
        height: 80,
        margin: '15px 30px'
      }}
    >
      <div
        style={{
          textAlign: 'center',
          fontSize: 32,
          marginTop: 15,
          fontFamily: 'Carter One',
          color: '#f44336',
          WebkitTextStroke: '1px black'
        }}
      >
        {title}
      </div>
    </PaperButton>
  )
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Home));
