import * as moment from 'moment';
import * as React from 'react';

import * as w from '../../types';
import ProfileLink from '../users/ProfileLink';

export default class CardProvenanceDescription extends React.PureComponent<{
  card: w.CardInStore
  style?: React.CSSProperties
  disableLinks?: boolean
}> {
  public render(): React.ReactNode {
    const { card, style, disableLinks } = this.props;
    const { source, updated } = card.metadata;
    if (source) {
      return (
        <div style={style || {}}>
          {source.type === 'builtin'
            ? 'Built-in card.'
            : (
              <span>
                Created by{' '}
                {!source.uid ? <i>unknown user</i> : (disableLinks ? source.username : <ProfileLink uid={source.uid} username={source.username!} />)}
                . {updated && `Last modified ${moment(updated).format('ll')}.`}
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
