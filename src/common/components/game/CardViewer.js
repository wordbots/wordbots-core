import React, { Component } from 'react';
import { object } from 'prop-types';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

import Sentence from '../cards/Sentence';
import { splitSentences } from '../../util/cards';

import Card from './Card';

export default class CardViewer extends Component {
  static propTypes = {
    hoveredCard: object
  };

  render() {
    return (
      <div style={{
        position: 'absolute',
        left: 10,
        top: 0,
        bottom: 0,
        margin: 'auto',
        height: 236 * 1.5
      }}>
        <CSSTransitionGroup
          transitionName="card-viewer-fade"
          transitionEnterTimeout={100}
          transitionLeaveTimeout={100}>
          {
            this.props.hoveredCard &&
              <Card
                onCardClick={() => {}}
                onCardHover={() => {}}
                scale={1.5}
                stats={this.props.hoveredCard.stats}
                name={this.props.hoveredCard.card.name}
                type={this.props.hoveredCard.card.type}
                spriteID={this.props.hoveredCard.card.spriteID}
                text={splitSentences(this.props.hoveredCard.card.text).map(s => Sentence(s, {parsed: true}))}
                rawText={this.props.hoveredCard.card.text}
                img={this.props.hoveredCard.card.img}
                cost={this.props.hoveredCard.card.cost}
                cardStats={this.props.hoveredCard.card.stats}
                source={this.props.hoveredCard.card.source}
                selected={false}
                visible />
          }
        </CSSTransitionGroup>
      </div>
    );
  }
}
