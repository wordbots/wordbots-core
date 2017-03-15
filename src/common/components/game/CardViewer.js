import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import FontIcon from 'material-ui/lib/font-icon';
import ReactTooltip from 'react-tooltip';

import Card from './Card';

class CardViewer extends Component {
  constructor(props) {
    super(props);
  }

  renderCardText() {
    if (this.props.hoveredCard.card.text) {
      const sentences = this.props.hoveredCard.card.text.match(/[^\.]+[\.]+/g);
      return sentences.map(sentence => {
        const treeUrl = `https://wordbots.herokuapp.com/parse?input=${encodeURIComponent(sentence)}&format=svg`;
        return (
          <span key={sentence}>
            {sentence}
            <a href={treeUrl} target="_blank">
              <FontIcon
                className="material-icons"
                style={{fontSize: '0.7em', verticalAlign: 'top', color: 'green'}}
                data-for="error-tooltip"
                data-tip="Click to view parse tree">
                  code
              </FontIcon>
              <ReactTooltip
                id="error-tooltip"
                place="top"
                type="dark"
                effect="float" />
            </a>
            {' '}
          </span>
        );
      });
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

CardViewer.propTypes = {
  hoveredCard: React.PropTypes.object
};

export default CardViewer;
