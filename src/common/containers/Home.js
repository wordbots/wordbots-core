import * as React from 'react';
import { func, object, string } from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as collectionActions from '../actions/collection';
import * as gameActions from '../actions/game';
import PaperButton from '../components/PaperButton';
import RecentCardsCarousel from '../components/cards/RecentCardsCarousel';

export function mapStateToProps(state) {
  return {
    version: state.version
  };
}

export function mapDispatchToProps(dispatch) {
  return {
    onOpenForEditing: (card) => {
      dispatch(collectionActions.openForEditing(card));
    },
    onStartTutorial: () => {
      dispatch(gameActions.startTutorial());
    }
  };
}

class Home extends React.Component {
  static propTypes = {
    version: string,

    history: object,

    onOpenForEditing: func,
    onStartTutorial: func
  };

  renderButton = (title, onClick) => (
    <PaperButton
      onClick={onClick}
      style={{
        flexBasis: 'calc(50% - 60px)',
        height: 80,
        margin: '15px 30px'
    }}>
      <div style={{
        textAlign: 'center',
        fontSize: 32,
        marginTop: 15,
        fontFamily: 'Carter One',
        color: '#f44336',
        WebkitTextStroke: '1px black'
      }}>
        {title}
      </div>
    </PaperButton>
  )

  render() {
    const [version, sha] = this.props.version.split('+');

    return (
      <div style={{margin: '48px 72px'}}>
        <Helmet title="Home"/>

        <div style={{
          margin: '10px 0',
          textAlign: 'center',
          fontSize: 24,
          color: '#666'
        }}>
          <p>Welcome to <span style={{
            fontFamily: 'Carter One',
            color: '#f44336',
            WebkitTextStroke: '1px black',
            fontSize: 28
          }}>Wordbots</span>, the customizable card game where <i><b>you</b></i>, the player, get to create the cards!</p>
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          flexDirection: 'row'
        }}>
          {this.renderButton('Tutorial', () => { this.props.history.push('play/tutorial'); this.props.onStartTutorial(); })}
          {this.renderButton('Play', () => { this.props.history.push('play'); })}
          {this.renderButton('Your Cards', () => { this.props.history.push('collection'); })}
          {this.renderButton('Card Creator', () => { this.props.history.push('creator'); })}
        </div>

        <RecentCardsCarousel
          history={this.props.history}
          onOpenForEditing={this.props.onOpenForEditing} />

        <div style={{
          position: 'fixed',
          bottom: 10,
          right: 10,
          fontSize: '0.7em'
        }}>
          v<a href={`https://github.com/wordbots/wordbots-core/releases/tag/v${version}`}>{version}</a>+{sha}
        </div>
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Home));
