import React, { Component } from 'react';
import Carousel from 'react-slick';
import { uniqBy } from 'lodash';

import { listenToRecentCards } from '../../util/firebase';
import { builtinCardNames } from '../../store/cards';
import PaperButton from '../PaperButton';
import Card from '../card/Card';

export default class RecentCardsCarousel extends Component {
  constructor() {
    super();

    this.state = {
      recentCards: []
    };
  }

  componentDidMount() {
    listenToRecentCards(data => {
      const recentCards = uniqBy(Object.values(data), 'name')
                            .filter(card => !builtinCardNames.includes(card.name))
                            .reverse()
                            .slice(0, 10);
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
    if (this.state.recentCards.length > 0) {
      return (
        <div>
          <Carousel dots infinite autoplay pauseOnHover
            arrows={false}
            speed={500}
            autoplaySpeed={1500}
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
            {
              this.state.recentCards.map(card =>
                <div key={card.id} style={{
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  {Card.fromObj(card)}
                </div>
              )
            }
          </Carousel>
          <p style={{
            marginTop: 30,
            color: '#999',
            fontSize: 20,
            fontWeight: 'bold',
            textTransform: 'uppercase',
            textAlign: 'center'
          }}>
            Most recently created cards
          </p>
        </div>
      );
    } else {
      return null;
    }
  }
}
