import * as fb from 'firebase';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { isGuest } from '../../util/multiplayer';

interface ProfileLinkProps {
  username: string
  uid?: string
  className?: string
  style?: React.CSSProperties
}

export default class ProfileLink extends React.Component<ProfileLinkProps> {
  public static fromFirebaseUser = (user: fb.User): JSX.Element => (
    <ProfileLink uid={user.uid} username={user.displayName || user.uid} />
  )

  get shouldOpenInNewTab(): boolean {
    // It doesn't make sense to open a profile in a new tab if we're already on a profile page.
    return !window.location.pathname.startsWith('/profile/');
  }

  public render(): React.ReactNode {
    const { uid, username, className, style } = this.props;

    // Don't render a link at all for guest accounts.
    if (!uid || isGuest(uid)) {
      return <span style={style}>{username}</span>;
    } else {
      const href = `/profile/${uid}`;

      // If we're already on a profile page, render an internal link.
      // Otherwise, open the link in a new tab.
      if (window.location.pathname.startsWith('/profile/')) {
        return <Link to={href} className={`profile-link ${className || ''}`} style={style}>{username}</Link>;
      } else {
        return (
          <a
            href={href}
            className={`profile-link ${className || ''}`}
            style={style}
            target="_blank"
            rel="noopener noreferrer"
          >
            {username}
          </a>
        );
      }

    }
  }
}
