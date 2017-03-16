import React, { Component } from 'react';
import FontIcon from 'material-ui/lib/font-icon';
import ReactTooltip from 'react-tooltip';

import { id } from '../../util';
import Card from '../game/Card';

class CardPreview extends Component {
  renderSentence(s) {
    function renderWord(word) {
      if ((s.result.unrecognizedTokens || []).includes(word.toLowerCase())) {
        return (
          <span key={id()}>
            {' '}<u>{word}</u>
          </span>
        );
      } else {
        return (
          <span key={id()}>
            {' '}{word}
          </span>
        );
      }
    }

    function renderStatusIcon() {
      const treeUrl = `https://wordbots.herokuapp.com/parse?input=${encodeURIComponent(s.sentence)}&format=svg`;
      if (s.result.js) {
        return (
          <a href={treeUrl} target="_blank">
            <FontIcon
              className="material-icons"
              style={{verticalAlign: 'top', color: 'green'}}
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
        );
      } else if (s.result.error) {
        return (
          <span>
            <FontIcon
              className="material-icons"
              style={{verticalAlign: 'top', color: 'red'}}
              data-for="error-tooltip"
              data-tip={s.result.error}>
                error_outline
            </FontIcon>
            <ReactTooltip
              id="error-tooltip"
              place="top"
              type="dark"
              effect="float" />
          </span>
        );
      }
    }

    if (/\S/.test(s.sentence)) {
      const color = s.result.js ? 'green' : (s.result.error ? 'red' : 'black');
      return (
        <span key={id()} style={{color: color}}>
          {s.sentence.split(' ').map(renderWord)}.
          { renderStatusIcon() }
        </span>
      );
    } else {
      return null;
    }
  }

  render() {
    const stats = {
      attack: this.props.attack,
      speed: this.props.speed,
      health: this.props.health
    };

    return (
      <div style={{width: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 64}}>
        <Card
          name={this.props.name || '[Unnamed]'}
          spriteID={this.props.spriteID}
          visible
          type={this.props.type}
          img={'char'}
          cost={this.props.energy}
          stats={stats}
          cardStats={stats}
          text={this.props.sentences.map(this.renderSentence)}
          rawText={this.props.sentences.map(s => s.sentence).join('. ')}
          scale={3}

          onCardHover={() => {}}
          onSpriteClick={this.props.onSpriteClick} />
      </div>
    );
  }
}

const { array, func, number, string } = React.PropTypes;

CardPreview.propTypes = {
  name: string,
  spriteID: string,
  type: number,
  sentences: array,
  attack: number,
  speed: number,
  health: number,
  energy: number,

  onSpriteClick: func
};

export default CardPreview;
