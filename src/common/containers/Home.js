import React, { Component } from 'react';
import { func, object, string } from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Paper from 'material-ui/Paper';
import { uniqBy } from 'lodash';

import { listenToRecentCards } from '../util/firebase';
import * as gameActions from '../actions/game';
import PaperButton from '../components/PaperButton';
import Card from '../components/card/Card';

export function mapStateToProps(state) {
  return {
    version: state.version
  };
}

export function mapDispatchToProps(dispatch) {
  return {
    onStartTutorial: () => {
      dispatch(gameActions.startTutorial());
    }
  };
}

class Home extends Component {
  static propTypes = {
    version: string,

    history: object,

    onStartTutorial: func
  };

  constructor() {
    super();

    this.state = {
      recentCards: []
    };
  }

  componentDidMount() {
    listenToRecentCards(data => {
      const recentCards = uniqBy(Object.values(data), 'id').slice(0, 5);
      this.setState({ recentCards });
    });
  }

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
    // const [version, sha] = this.props.version.split('+');

    return (
      <div style={{margin: '48px 72px'}}>
        <Helmet title="Home"/>

        <Paper style={{
          margin: '15px 30px',
          padding: '5px 0px',
          textAlign: 'center'
        }}>
          <p>Welcome to Wordbots, the customizable card game where <i>you</i>, the player, get to create the cards!</p>
        </Paper>

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

        <Paper style={{
          margin: '15px 30px',
          padding: '5px 0px',
          textAlign: 'center'
        }}>
          <p>Most recently created cards:</p>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: 900,
            margin: '0 auto'
          }}>
            {this.state.recentCards.map(Card.fromObj)}
          </div>
        </Paper>
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Home));
