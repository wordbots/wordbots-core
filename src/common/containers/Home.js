import React, {Component} from 'react';
import {func, object, string} from 'prop-types';
import Helmet from 'react-helmet';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import Carousel from 'react-slick';
import {uniqBy} from 'lodash';

import {listenToRecentCards} from '../util/firebase';
import * as gameActions from '../actions/game';
import PaperButton from '../components/PaperButton';
import Card from '../components/card/Card';

export function mapStateToProps(state){
  return {
    version: state.version
  };
}

export function mapDispatchToProps(dispatch){
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
      const recentCards = uniqBy(Object.values(data), 'id').reverse().slice(0, 10);
      this.setState({recentCards});
    });
  }

  renderButton = (title, onClick) => (
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
  );

  renderRecentCards = () => {
    if (this.state.recentCards.length > 0) {
      return (
        <div>
          <Carousel
            dots
            infinite
            autoplay
            pauseOnHover
            arrows={false}
            speed={500}
            autoplaySpeed={1000}
            slidesToScroll={1}
            responsive={[
              {breakpoint: 950, settings: {slidesToShow: 3}},
              {breakpoint: 1150, settings: {slidesToShow: 4}},
              {breakpoint: 1350, settings: {slidesToShow: 5}},
              {breakpoint: 1550, settings: {slidesToShow: 6}},
              {breakpoint: 1750, settings: {slidesToShow: 7}},
              {breakpoint: 1950, settings: {slidesToShow: 8}},
              {breakpoint: 100000, settings: {slidesToShow: 8}}
            ]}
          >
            {this.state.recentCards.map(card => (
              <div
                key={card.id}
                style={{
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                {Card.fromObj(card)}
              </div>
            ))}
          </Carousel>
          <p
            style={{
              marginTop: 30,
              color: '#999',
              fontSize: 20,
              fontWeight: 'bold',
              textTransform: 'uppercase',
              textAlign: 'center'
            }}
          >
            Most recently created cards
          </p>
        </div>
      );
    } else {
      return null;
    }
  };

  render() {
    const [ version, sha ] = this.props.version.split('+');

    return (
      <div style={{margin: '48px 72px'}}>
        <Helmet title="Home" />

        <div
          style={{
            margin: '10px 0',
            textAlign: 'center',
            fontSize: 24,
            color: '#666'
          }}
        >
          <p>
            Welcome to{' '}
            <span
              style={{
                fontFamily: 'Carter One',
                color: '#f44336',
                WebkitTextStroke: '1px black',
                fontSize: 28
              }}
            >
              Wordbots
            </span>, the customizable card game where{' '}
            <i>
              <b>you</b>
            </i>, the player, get to create the cards!
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            flexDirection: 'row'
          }}
        >
          {this.renderButton('Tutorial', () => {
            this.props.history.push('play/tutorial');
            this.props.onStartTutorial();
          })}
          {this.renderButton('Play', () => {
            this.props.history.push('play');
          })}
          {this.renderButton('Your Cards', () => {
            this.props.history.push('collection');
          })}
          {this.renderButton('Card Creator', () => {
            this.props.history.push('creator');
          })}
        </div>

        {this.renderRecentCards()}

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
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Home));
