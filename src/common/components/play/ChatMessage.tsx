import * as React from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import * as w from '../../types';
import CardTooltip from '../card/CardTooltip';

interface ChatMessageProps {
  message: w.ChatMessage
  idx: number
}

export default class ChatMessage extends React.Component<ChatMessageProps> {
  public render(): JSX.Element {
    const { message, idx } = this.props;

    return (
      <TransitionGroup key={idx}>
        <CSSTransition
          appear
          timeout={1000}
          classNames="chat-message"
        >
          <div
            key={idx}
            className="chat-message"
            style={{
              color: ['[Game]', '[Server]'].includes(message.user) ? '#888' : '#000',
              marginBottom: 5,
              wordBreak: 'break-word'
            }}
          >
            <b>{message.user}</b>:&nbsp;
            {message.text.split('|').map((phrase, phraseIdx) => this.renderPhrase(phrase, message, idx, phraseIdx))}
          </div>
        </CSSTransition>
      </TransitionGroup>
    );
  }

  private renderPhrase = (phrase: string, message: w.ChatMessage, messageIdx: number, phraseIdx: number) => {
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
