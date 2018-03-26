import React, { Component } from 'react';
import { object, number } from 'prop-types';
import { CSSTransition } from 'react-transition-group';

import CardTooltip from '../card/CardTooltip';

export default class ChatMessage extends Component {
  static propTypes = {
    message: object,
    idx: number
  };

  render() {
    const { message, idx } = this.props;
    const fadeTimeMs = 500;

    return (
      <CSSTransition
        key={idx}
        timeout={fadeTimeMs}
        classNames="chat-message"
      >
        <div
          name="chat-message"
          key={idx}
          style={{
            color: ['[Game]', '[Server]'].includes(message.user) ? '#888' : '#000',
            marginBottom: 5,
            wordBreak: 'break-word'
          }}>
          <b>{message.user}</b>:&nbsp;
          {message.text.split('|').map((phrase, phraseIdx) => this.renderPhrase(phrase, message, idx, phraseIdx))}
        </div>
      </CSSTransition>
    );
  }

  renderPhrase = (phrase, message, messageIdx, phraseIdx) => {
    const card = (message.cards || {})[phrase];
    const key = `${messageIdx}_${phrase}_${phraseIdx}`;
    if (card) {
      return (
        <CardTooltip key={key} card={card}>
          <span style={{fontWeight: 'bold', cursor: 'pointer'}}>
            {phrase}
          </span>
        </CardTooltip>
      );
    } else {
      return (
        <span key={key}>
          {phrase}
        </span>
      );
    }
  }
}
