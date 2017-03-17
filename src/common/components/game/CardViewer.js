import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import Sentence from '../cards/Sentence';

import Card from './Card';

// TODO somehow combine this with CardPreview component, or at least de-duplicate some logic.

class CardViewer extends Component {
  constructor(props) {
    super(props);
  }

  renderCardText() {
    const text = this.props.hoveredCard.card.text;
    if (text) {
      const sentences = text.split(/[\\.!\?]/).filter(s => /\S/.test(s));
      return sentences.map(s => Sentence(s, {parsed: true}));
    } else {
      return '';
    }
  }

  render() {
    let card = null;

    if (this.props.hoveredCard) {
      card = (
        <Card
          onCardClick={() => {}}
          onCardHover={() => {}}
          scale={1.5}
          stats={this.props.hoveredCard.stats}
          name={this.props.hoveredCard.card.name}
          type={this.props.hoveredCard.card.type}
          spriteID={this.props.hoveredCard.card.spriteID}
          text={this.renderCardText()}
          rawText={this.props.hoveredCard.card.text}
          img={this.props.hoveredCard.card.img}
          cost={this.props.hoveredCard.card.cost}
          cardStats={this.props.hoveredCard.card.stats}
          source={this.props.hoveredCard.card.source}
          selected={false}
          visible />
      );
    }

    return (
      <div style={{
        position: 'absolute',
        left: 10,
        top: 0,
        bottom: 0,
        margin: 'auto',
        height: 236 * 1.5
      }}>
        <ReactCSSTransitionGroup
          transitionName="card-viewer-fade"
          transitionEnterTimeout={100}
          transitionLeaveTimeout={100}>
          {card}
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}

const { object } = React.PropTypes;

CardViewer.propTypes = {
  hoveredCard: object
};

export default CardViewer;
