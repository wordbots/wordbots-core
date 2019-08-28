import * as moment from 'moment';
import * as React from 'react';

import * as w from '../../types';
import ProfileLink from '../users/ProfileLink';

export default class CardProvenanceDescription extends React.Component<{card: w.CardInStore, style?: React.CSSProperties}> {
  public render(): React.ReactNode {
    const { source, timestamp } = this.props.card;
    if (source) {
      return (
        <div style={this.props.style || {}}>
          {source === 'builtin'
            ? 'Built-in card.'
            : (
              <span>
                Created by{' '}
                {(source as any) === 'user'
                  ? <i>unknown user</i>
                  : <ProfileLink uid={source.uid} username={source.username} />
                }
                . {timestamp && `Last modified ${moment(timestamp).format('ll')}.`}
              </span>
            )
          }
        </div>
      );
    } else {
      return null;
    }
  }
}
