import * as React from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import * as w from '../../types';
import CardTooltip from '../card/CardTooltip';

interface ChatMessageProps {
  message: w.ChatMessage
  idx: number
  debugMode?: boolean
}

export default class ChatMessage extends React.Component<ChatMessageProps> {
  public render(): JSX.Element {
    const { message, idx, debugMode } = this.props;
    const { text, timestamp, user } = message;

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
              color: ['[Game]', '[Server]'].includes(user) ? '#888' : (user === '[Debug]' ? '#aaa' : '#000'),
              fontSize: user === '[Debug]' ? '0.7em' : undefined,
              whiteSpace: user === '[Debug]' ? 'pre-line' : undefined,
              marginBottom: 5,
              wordBreak: 'break-word'
            }}
          >
            {debugMode && <div style={{ fontSize: '0.6em', textAlign: 'end' }}>
              {new Date(timestamp).toLocaleString()}
            </div>}
            <b>{user}</b>:&nbsp;
            {text.split('|').map((phrase, phraseIdx) => this.renderPhrase(phrase, message, idx, phraseIdx))}
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
          <span style={{ fontWeight: 'bold', cursor: 'pointer' }}>
            {card.name}
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
