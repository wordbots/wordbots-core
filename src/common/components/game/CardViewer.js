import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import Card from './Card';

class CardViewer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let card = null;

    if (this.props.hoveredCard) {
      card = (
        <Card
          onCardClick={() => {}}
          scale={1.5}
          stats={this.props.hoveredCard.stats}
          name={this.props.hoveredCard.card.name}
          type={this.props.hoveredCard.card.type}
          text={this.props.hoveredCard.card.text || ''}
          img={this.props.hoveredCard.card.img}
          cost={this.props.hoveredCard.card.cost}
          cardStats={this.props.hoveredCard.card.stats}
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

CardViewer.propTypes = {
  hoveredCard: React.PropTypes.object
};

export default CardViewer;
