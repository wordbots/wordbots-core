import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import FontIcon from 'material-ui/lib/font-icon';
import ReactTooltip from 'react-tooltip';

import keywords from '../../keywords';

import Card from './Card';

// TODO somehow combine this with CardPreview component, or at least de-duplicate some logic.

class CardViewer extends Component {
  constructor(props) {
    super(props);
  }

  renderCardText() {
    function renderSentence(sentence) {
      if (keywords[sentence]) {
        return (
          <span key={sentence}>
            {' '}<b data-for={sentence} data-tip={`${keywords[sentence]}.`}>{sentence}</b>.
            <ReactTooltip id={sentence} place="top" type="dark" effect="float" />
          </span>
        );
      } else {
        return `${sentence}.`;
      }
    }

    const text = this.props.hoveredCard.card.text;
    if (text) {
      const sentences = text.split(/[\\.!\?]/).filter(s => /\S/.test(s));
      return sentences.map(sentence => {
        const parserInput = encodeURIComponent(keywords[sentence] || sentence);
        const treeUrl = `https://wordbots.herokuapp.com/parse?input=${parserInput}&format=svg`;
        return (
          <span key={sentence}>
            {renderSentence(sentence)}
            <a href={treeUrl} target="_blank">
              <FontIcon
                className="material-icons"
                style={{fontSize: '0.7em', verticalAlign: 'top', color: 'green'}}
                data-for="tree-tooltip"
                data-tip="Click to view parse tree">
                  code
              </FontIcon>
              <ReactTooltip id="tree-tooltip" place="top" type="dark" effect="float" />
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
          spriteID={this.props.hoveredCard.spriteID}
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
